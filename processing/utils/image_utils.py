import numpy as np
import PIL.Image as PImage

from PIL import ImageFilter as PImageFilter
from scipy.ndimage import convolve


## Image Helpers

def to1d(ndarr):
  if ndarr.shape[-1] == 3 or ndarr.shape[-1] == 4:
    return ndarr.reshape(-1, ndarr.shape[-1]).tolist()
  return ndarr.reshape(-1).tolist()


def get_pixels(img):
  return list(img.getdata())


def make_image(pxs, width=None, height=None):
  if hasattr(pxs, "iloc") and hasattr(pxs, "values"):
    pxs = pxs.values
    if len(pxs.shape) < 2:
      pxs = pxs.reshape(-1, 1)
    pxs = to1d(pxs)
  elif hasattr(pxs, "shape") and hasattr(pxs, "reshape"):
    if hasattr(pxs, "int"):
      pxs = pxs.int()
    if hasattr(pxs, "astype"):
      pxs = pxs.astype("int")
    pxs = to1d(pxs)

  MODES = ["", "L", "XX", "RGB", "RGBA"]
  nw = int(len(pxs) ** 0.5) if width is None else width
  nh = int(len(pxs) // nw) if height is None else height

  pxs = [tuple(p) for p in pxs] if type(pxs[0]) is list else pxs

  nc = len(pxs[0]) if type(pxs[0]) is tuple else 1

  mimg = PImage.new(MODES[nc], (nw,nh))
  mimg.putdata(pxs[ :(nw * nh)])

  return mimg

def update_pixels(mimg, pxs=None, width=None, height=None):
  if pxs is None:
    pxs = mimg.pixels

  iw, ih = mimg.size
  if len(pxs) != iw * ih:
    ar = ih / iw
    nw = int((len(pxs) / ar) ** 0.5) if width is None else width
    nh = int(len(pxs) // nw) if height is None else height
    if nw <= iw and nh <= ih:
      dw = max(0, iw - nw)
      dh = max(0, ih - nh)
      nc = len(pxs[0]) if type(pxs[0]) is tuple else 1
      nppxs = np.array(pxs[ :nw * nh]).reshape(nh, nw, nc)
      pcols = np.hstack((nppxs, np.zeros((nh,dw,nc), np.int8)))
      prows = np.vstack((pcols, np.zeros((dh,iw,nc), np.int8)))
      pxs = [tuple(v) if nc > 1 else v for v in prows.reshape(-1,nc).tolist()]
    else:
      raise Exception("pixel array is too big for image")

  if not (type(pxs[0]) is int or type(pxs[0]) is tuple):
    raise Exception("array has wrong content type: must be int or tuple")

  if type(pxs[0]) is int and len(mimg.getbands()) != 1:
    pxs = [(p, p, p) for p in pxs]

  if type(pxs[0]) is tuple and len(mimg.getbands()) > len(pxs[0]):
    pxs = [(r,g,b,255) for r,g,b in pxs]

  if type(pxs[0]) is tuple and len(pxs[0]) > len(mimg.getbands()) and len(mimg.getbands()) == 1:
    pxs = [(rgb[0]+rgb[1]+rgb[2])//3 for rgb in pxs]

  if type(pxs[0]) is tuple and len(pxs[0]) > len(mimg.getbands()) and len(mimg.getbands()) != 1:
    pxs = [(rgb[0], rgb[1], rgb[2]) for rgb in pxs]

  if type(pxs[0]) is tuple and len(pxs[0]) != len(mimg.getbands()):
    raise Exception("array has wrong content format: number of channels must match original")

  mimg.putdata(pxs)
  return mimg


## Image Analysis

def constrain_uint8(v):
  return int(min(max(v, 0), 255))

def blur(img, rad=1.0):
  return img.filter(PImageFilter.GaussianBlur(rad))

def edges_rgb(img, rad=1.0):
  bimg = blur(img, rad)
  pxs = get_pixels(img)
  bpxs = get_pixels(bimg)

  bdiffpx = []
  for (r0,g0,b0), (r1,g1,b1) in zip(bpxs, pxs):
    bdiffpx.append((
      constrain_uint8(np.exp(r1-r0)),
      constrain_uint8(np.exp(g1-g0)),
      constrain_uint8(np.exp(b1-b0)),
    ))

  bimg = make_image(bdiffpx, bimg.size[0])
  return bimg

def edges_exp_thold(img, rad=1.0):
  bimg = blur(img, rad)
  pxs = get_pixels(img)
  bpxs = get_pixels(bimg)

  bdiffpx = []
  for (r0,g0,b0), (r1,g1,b1) in zip(bpxs, pxs):
    bdiffpx.append(constrain_uint8(np.exp(r1-r0)))

  bimg = make_image(bdiffpx, bimg.size[0])
  return bimg

def edges(img, rad=1, thold=16):
  bimg = blur(img, rad)

  # get luminance
  gipxs = [(r+g+b)//3 for r,g,b in get_pixels(img)]
  gbpxs = [(r+g+b)//3 for r,g,b in get_pixels(bimg)]

  # subtract and threshold
  epxs = [255 if (o-b)>thold else 0 for o,b in zip(gipxs, gbpxs)]

  # prepare output
  eimg = make_image(epxs, img.size[0])
  return eimg

def conv2d(img, kernel):
  pxs = np.array(img.convert("L").getdata()).reshape(img.size[1], -1).astype(np.uint8)
  krl = np.array(kernel)
  cpxs = convolve(pxs, krl).reshape(-1).astype(np.uint8).tolist()

  # returns plain PImage
  w,h = img.size
  nimg = PImage.new(img.getbands(), (w, h))
  nimg.putdata(cpxs)

  return nimg

def conv2drgb(img, kernel):
  pxs = np.array(img.getdata()).reshape(img.size[1], -1, 3).astype(np.uint8)
  krl = np.repeat(np.array(kernel).reshape(len(kernel), len(kernel[0]), 1), 3, axis=2)
  _cpxs = convolve(pxs, krl).reshape(-1, 3).astype(np.uint8).tolist()
  cpxs = [(r,g,b) for r,g,b in _cpxs]

  # returns plain PImage
  w,h = img.size
  nimg = PImage.new(img.getbands(), (w, h))
  nimg.putdata(cpxs)

  return nimg
