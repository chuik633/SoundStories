import json
import pandas as pd
import colorsys

from os import listdir
from PIL import Image as PImage

from utils.image_utils import *
from utils.data_utils import GaussianClustering

def get_main_colors_clusters(imgPath): 
    # get image and convert pixels into a dataframe
    pimg = PImage.open(imgPath).convert("RGB")
    pxs = get_pixels(pimg)
    pxs_df = pd.DataFrame(pxs, columns = ['R', 'G', 'B'])
    

    # create clustering model
    model = GaussianClustering(n_clusters = 8) #get 8 colors first
    predicted = model.fit_predict(pxs_df[['R', 'G', 'B']])

    # post process clustering result
    ccounts = predicted['clusters'].value_counts()
    colors = []
    for clusterNum in ccounts.index[:5]:
        r,g,b = model.cluster_centers_[clusterNum]
        colors.append([round(r), round(g), round(b)])

    sorted_colors = sorted(colors, key=rgb_to_saturation, reverse=True)
    return sorted_colors

def rgb_to_saturation(c):
    r, g, b = c[0] / 255.0, c[1] / 255.0, c[2] / 255.0
    hsv = colorsys.rgb_to_hsv(r,g,b)
    return hsv[1]


def get_main_colors(imgPath,  color_similarity_threshold = 100):
    pimg =  PImage.open(imgPath).convert("RGB")
    pxs = get_pixels(pimg)

    main_colors = []
    def color_distance(c1, c2):
        d = 0
        for i in range(len(c1)):
            d += (c1[i]-c2[i])**2
        d = d**.5
        return d

    def color_unique(c):
        for existing_color in main_colors:
            dist = color_distance(existing_color, c) 
            # print(dist)
            if dist < color_similarity_threshold: 
                return False, existing_color
        
        return True, c

    for color in pxs:
        unique, color = color_unique(color)

        if unique:
            main_colors.append(color)

    main_colors = [list(c) for c in main_colors]
    sorted_colors = sorted(main_colors, key=rgb_to_saturation, reverse=True)
    return sorted_colors[:10]





def getImageData(moviePath, name):
    imgDir = moviePath + 'images/'
    img_files = [f for f in listdir(imgDir)]
    file_colors = []
    for img_file in img_files:
        i=int(img_file.split('.')[0])
        colors = get_main_colors(imgDir + img_file, 100)
        file_colors.append({
            'filename': img_file,
            'colors': colors,
            'sceneNum':i
        })

    color_df = pd.DataFrame(file_colors)
    color_df.to_json(moviePath+"imageSceneData.json", orient = 'records')

