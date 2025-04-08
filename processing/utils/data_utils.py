import json
import matplotlib.cm as cm
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import PIL.Image as PImage
import string
import urllib.request as request

from numpy.linalg import det as np_det, inv as np_inv
from os import listdir, path
from random import seed, shuffle

from sklearn.cluster import KMeans as SklKMeans, SpectralClustering as SklSpectralClustering
from sklearn.decomposition import PCA as SklPCA
from sklearn.ensemble import RandomForestClassifier as SklRandomForestClassifier
from sklearn.linear_model import LinearRegression as SklLinearRegression
from sklearn.linear_model import LogisticRegression as SklLogisticRegression
from sklearn.linear_model import SGDRegressor as SklSGDRegressor, SGDClassifier as SklSGDClassifier
from sklearn.manifold import TSNE as SklTSNE
from sklearn.metrics import ConfusionMatrixDisplay, accuracy_score, confusion_matrix, root_mean_squared_error
from sklearn.metrics import silhouette_score as skl_silhouette_score, silhouette_samples as skl_silhouette_samples
from sklearn.mixture import GaussianMixture as SklGaussianMixture
from sklearn.preprocessing import MinMaxScaler as SklMinMaxScaler
from sklearn.preprocessing import StandardScaler as SklStandardScaler
from sklearn.preprocessing import PolynomialFeatures as SklPolynomialFeatures
from sklearn.svm import SVC as SklSVC

from warnings import simplefilter


def object_from_json_url(url):
  with request.urlopen(url) as in_file:
    return json.load(in_file)


def isDataFrame(X):
  return isinstance(X, pd.core.frame.DataFrame)

def isSeries(X):
  return isinstance(X, pd.core.series.Series)


def regression_error(labels, predicted):
  if not (isDataFrame(labels) or isSeries(labels)):
    raise Exception("truth labels has wrong type. Please use pandas DataFrame or Series")
  if not (isDataFrame(predicted) or isSeries(predicted)):
    raise Exception("predicted labels has wrong type. Please use pandas DataFrame or Series")

  return root_mean_squared_error(labels.values, predicted.values)


def classification_error(labels, predicted):
  if not (isDataFrame(labels) or isSeries(labels)):
    try:
      labels = pd.DataFrame(labels)
    except:
      raise Exception("truth labels has wrong type. Please use pandas DataFrame or Series")
  if not (isDataFrame(predicted) or isSeries(predicted)):
    try:
      predicted = pd.DataFrame(predicted)
    except:
      raise Exception("predicted labels has wrong type. Please use pandas DataFrame or Series")

  return 1.0 - accuracy_score(labels.values, predicted.values)


def accuracy_score_proba(labels, probs, k=1):
  sorted_idxs = probs.argsort(axis=1)
  if type(k) is int:
    pred_k = sorted_idxs[:, -k:]
  else:
    pred_k = [[idx for idx in idxs if probs[pi, idx] > k] for pi,idxs in enumerate(sorted_idxs)]

  sum = 0
  for l,p in zip(labels, pred_k):
    sum += l in p

  return sum / len(labels)


def display_confusion_matrix(labels, predicted, display_labels):
  simplefilter(action='ignore', category=FutureWarning)
  ConfusionMatrixDisplay.from_predictions(labels, predicted, display_labels=display_labels, xticks_rotation="vertical")


class PolynomialFeatures(SklPolynomialFeatures):
  def __init__(self, **kwargs):
    super().__init__(**kwargs)

  def fit_transform(self, X, *args, **kwargs):
    if not isDataFrame(X):
      raise Exception("Feature input has wrong type. Please use pandas DataFrame")

    self.columns = X.columns
    self.shape = X.shape
    X_t = super().fit_transform(X.values, *args, **kwargs)
    return pd.DataFrame(X_t, columns=self.get_feature_names_out())

  def transform(self, X, *args, **kwargs):
    if type(X) == np.ndarray:
      return super().transform(X, *args, **kwargs)

    if not isDataFrame(X):
      raise Exception("Feature input has wrong type. Please use pandas DataFrame")
    if list(self.columns) != list(X.columns) or self.shape[1] != X.shape[1]:
      raise Exception("Input has wrong shape.")

    X_t = super().transform(X.values, *args, **kwargs)
    return pd.DataFrame(X_t, columns=self.get_feature_names_out())


class Predictor():
  def __init__(self, type, **kwargs):
    if type == "linear":
      self.model = SklLinearRegression(**kwargs)
    elif type == "logistic":
      self.model = SklLogisticRegression(**kwargs)
    elif type == "sgdr":
      self.model = SklSGDRegressor(**kwargs)
    elif type == "sgdc":
      self.model = SklSGDClassifier(**kwargs)
    elif type == "forest":
      if "max_depth" not in kwargs:
        kwargs["max_depth"] = 16
      self.model = SklRandomForestClassifier(**kwargs)
    elif type == "svc":
      if "kernel" not in kwargs:
        kwargs["kernel"] = "linear"
      self.model = SklSVC(**kwargs)

  def __getattr__(self, name):
    return getattr(self.model, name)

  def fit(self, X, y, *args, **kwargs):
    if not isDataFrame(X):
      raise Exception("Feature input has wrong type. Please use pandas DataFrame")
    if not (isDataFrame(y) or isSeries(y)):
      raise Exception("Label input has wrong type. Please use pandas DataFrame or Series")

    self.y_name = [y.name] if len(y.shape) == 1 else y.columns.values
    self.model.fit(X.values, y.values, *args, **kwargs)
    return self

  def predict(self, X, *args, **kwargs):
    if not isDataFrame(X):
      raise Exception("Feature input has wrong type. Please use pandas DataFrame")
    y_t = self.model.predict(X.values, *args, **kwargs)
    return pd.DataFrame(y_t, columns=self.y_name)


class Scaler():
  def __init__(self, type, **kwargs):
    if type == "minmax":
      self.scaler = SklMinMaxScaler(**kwargs)
    elif type == "std":
      self.scaler = SklStandardScaler(**kwargs)

  def __getattr__(self, name):
    return getattr(self.model, name)

  def fit_transform(self, X, *args, **kwargs):
    if not isDataFrame(X):
      raise Exception("Input has wrong type. Please use pandas DataFrame")

    self.columns = X.columns
    self.shape = X.shape
    X_t = self.scaler.fit_transform(X.values, *args, **kwargs)
    return pd.DataFrame(X_t, columns=X.columns)

  def transform(self, X, *args, **kwargs):
    if type(X) == np.ndarray:
      return self.scaler.transform(X, *args, **kwargs)

    if not isDataFrame(X):
      raise Exception("Input has wrong type. Please use pandas DataFrame")
    if list(self.columns) != list(X.columns) or self.shape[1] != X.shape[1]:
      raise Exception("Input has wrong shape.")

    X_t = self.scaler.transform(X.values, *args, **kwargs)
    return pd.DataFrame(X_t, columns=X.columns)

  def inverse_transform(self, X, *args, **kwargs):
    if not (isDataFrame(X) or isSeries(X)):
      raise Exception("Input has wrong type. Please use pandas DataFrame or Series")

    col = ""
    col_vals = []

    if len(X.shape) == 1:
      col = X.name
      col_vals = X.values
    elif len(X.shape) == 2 and X.shape[1] == 1:
      col = X.columns[0]
      col_vals = X[col].values

    if col != "":
      X = pd.DataFrame(X.values, columns=[col])
      dummy_df = pd.DataFrame(np.zeros((len(col_vals), self.shape[1])), columns=self.columns)
      dummy_df[col] = col_vals
      X_t = self.scaler.inverse_transform(dummy_df.values, *args, **kwargs)
      return pd.DataFrame(X_t, columns=self.columns)[[col]]

    else:
      X_t = self.scaler.inverse_transform(X.values, *args, **kwargs)
      return pd.DataFrame(X_t, columns=X.columns)


class Clusterer():
  def __init__(self, type, **kwargs):
    self.num_clusters = 0
    kwargs["n_init"] = 10
    if type == "kmeans":
      self.model = SklKMeans(**kwargs)
    elif type == "gaussian":
      if "n_clusters" in kwargs:
        kwargs["n_components"] = kwargs["n_clusters"]
        del kwargs["n_clusters"]
      self.model = SklGaussianMixture(**kwargs)
    elif type == "spectral":
      if "affinity" not in kwargs:
        kwargs["affinity"] = 'nearest_neighbors'
      if "n_clusters" in kwargs:
        kwargs["n_clusters"] += 0
      self.model = SklSpectralClustering(**kwargs)

  def __getattr__(self, name):
    return getattr(self.model, name)

  def fit_predict(self, X, *args, **kwargs):
    if not isDataFrame(X):
      raise Exception("Input has wrong type. Please use pandas DataFrame")

    y = self.model.fit_predict(X.values, *args, **kwargs)
    self.X = X.values
    self.y = y
    self.num_clusters = len(np.unique(y))
    self.num_features = self.X.shape[1]
    self.cluster_centers_ = np.array([self.X[self.y == c].mean(axis=0) for c in range(self.num_clusters)]).tolist()
    return pd.DataFrame(y, columns=["clusters"])

  def distance_score(self):
    if self.num_clusters < 1:
      raise Exception("Error: need to run fit_predict() first")

    point_centers = [self.cluster_centers_[i] for i in self.y]
    point_diffs = np.array([p - c for p,c in zip(self.X, point_centers)])

    cluster_L2 = [np.sqrt(np.square(point_diffs[self.y == c]).sum(axis=1)).mean() for c in range(self.num_clusters)]

    return sum(cluster_L2) / len(cluster_L2)

  def balance_score(self):
    if self.num_clusters < 1:
      raise Exception("Error: need to run fit_predict() first")
    counts = np.unique(self.y, return_counts=True)[1]
    sum_dists = np.abs(counts / len(self.y) - (1 / self.num_clusters)).sum()
    scale_factor = 0.5 * self.num_clusters / (self.num_clusters - 1)
    return 1.0 - (scale_factor * sum_dists)

  def silhouette_score(self):
    if self.num_clusters < 1:
      raise Exception("Error: need to run fit_predict() first")
    return skl_silhouette_score(self.X, self.y)

  def plot_silhouette(self):
    sample_silhouette_values = skl_silhouette_samples(self.X, self.y)
    silhouette_average = skl_silhouette_score(self.X, self.y)

    y_lower = 10
    for i in range(self.num_clusters):
      ith_cluster_silhouette_values = sample_silhouette_values[self.y == i]
      ith_cluster_silhouette_values.sort()

      size_cluster_i = ith_cluster_silhouette_values.shape[0]
      y_upper = y_lower + size_cluster_i

      color = cm.nipy_spectral(float(i) / self.num_clusters)
      plt.fill_betweenx(
        np.arange(y_lower, y_upper),
        0,
        ith_cluster_silhouette_values,
        facecolor=color,
        edgecolor=color,
        alpha=0.7,
      )

      # Label the silhouette plots with their cluster numbers at the middle
      plt.text(-0.05, y_lower + 0.5 * size_cluster_i, str(i))

      # Compute the new y_lower for next plot
      y_lower = y_upper + 10

    plt.title("Silhouette Plot")
    plt.xlabel("Silhouette coefficient values")
    plt.ylabel("Cluster label")

    # The vertical line for average silhouette score of all the values
    plt.axvline(x=silhouette_average, color="red", linestyle="--")

    plt.yticks([])
    plt.xticks([-0.1, 0, 0.2, 0.4, 0.6, 0.8, 1])
    plt.show()

class Reducer():
  def __init__(self, type, **kwargs):
    self.t_labels = []
    self.o_labels = None
    if type == "pca":
      self.reducer = SklPCA(**kwargs)
      self.col_pre = "PC"
    elif type == "tsne":
      self.reducer = SklTSNE(**kwargs)
      self.col_pre = "TSNE"
    self.n_components = self.reducer.n_components

  def __getattr__(self, name):
    return getattr(self.model, name)

  def check_input(self, X):
    if isDataFrame(X):
      self.o_labels = X.columns
      X = X.values.tolist()
    if not isinstance(X, list):
      raise Exception("Input has wrong type. Please use list of list of pixels")
    if not isinstance(X[0], list):
      raise Exception("Input has wrong type. Please use list of list of pixels")
    return X

  def fit(self, X, *args, **kwargs):
    X = self.check_input(X)
    X_np = np.array(X)
    self.reducer.fit(X_np, *args, **kwargs)
    self.t_labels = [f"{self.col_pre}{i}" for i in range(self.n_components)]

  def transform(self, X, *args, **kwargs):
    if len(self.t_labels) != self.n_components:
      raise Exception("Error: need to run fit() first")
    X = self.check_input(X)
    X_np = np.array(X)
    if hasattr(self.reducer, "transform"):
      X_t = self.reducer.transform(X_np, *args, **kwargs)
      self.components = self.reducer.components_
    else:
      X_t = self.reducer.fit_transform(X_np, *args, **kwargs)
    X_obj = [{f"{self.col_pre}{i}": v for i,v in enumerate(x)} for x in X_t]
    return pd.DataFrame.from_records(X_obj)

  def fit_transform(self, X, *args, **kwargs):
    self.fit(X, *args, **kwargs)
    return self.transform(X, *args, **kwargs)

  def inverse_transform(self, X_t, *args, **kwargs):
    if not (isDataFrame(X_t) or isSeries(X_t)):
      raise Exception("Input has wrong type. Please use pandas DataFrame or Series")
    if len(self.t_labels) != self.n_components:
      raise Exception("Error: need to run fit() first")

    X_t_np = X_t[self.t_labels].values
    if isDataFrame(X_t) and X_t_np.shape[1] != self.n_components:
      raise Exception("Input has wrong shape. Check number of features")
    if isSeries(X_t) and X_t_np.shape[0] != self.n_components:
      raise Exception("Input has wrong shape. Check number of features")

    X_i_np = self.reducer.inverse_transform(X_t_np, *args, **kwargs)
    return pd.DataFrame(X_i_np, columns=self.o_labels)

  def explained_variance(self):
    if len(self.t_labels) != self.n_components:
      raise Exception("Error: need to run fit() first")
    return sum(self.reducer.explained_variance_ratio_)


class LinearRegression(Predictor):
  def __init__(self, **kwargs):
    super().__init__("linear", **kwargs)

class LogisticRegression(Predictor):
  def __init__(self, **kwargs):
    super().__init__("logistic", **kwargs)

class SGDRegressor(Predictor):
  def __init__(self, **kwargs):
    super().__init__("sgdr", **kwargs)

class SGDClassifier(Predictor):
  def __init__(self, **kwargs):
    super().__init__("sgdc", **kwargs)

class RandomForestClassifier(Predictor):
  def __init__(self, **kwargs):
    super().__init__("forest", **kwargs)

class SVC(Predictor):
  def __init__(self, **kwargs):
    super().__init__("svc", **kwargs)

class MinMaxScaler(Scaler):
  def __init__(self, **kwargs):
    super().__init__("minmax", **kwargs)

class StandardScaler(Scaler):
  def __init__(self, **kwargs):
    super().__init__("std", **kwargs)

class KMeansClustering(Clusterer):
  def __init__(self, **kwargs):
    super().__init__("kmeans", **kwargs)

class GaussianClustering(Clusterer):
  def __init__(self, **kwargs):
    super().__init__("gaussian", **kwargs)

class SpectralClustering(Clusterer):
  def __init__(self, **kwargs):
    super().__init__("spectral", **kwargs)

class PCA(Reducer):
  def __init__(self, **kwargs):
    super().__init__("pca", **kwargs)

class TSNE(Reducer):
  def __init__(self, **kwargs):
    super().__init__("tsne", **kwargs)


class LFWUtils:
  FACE_IMAGES = "./data/images/lfw/cropped"
  if not path.isdir(FACE_IMAGES):
    FACE_IMAGES = FACE_IMAGES.replace("/images/lfw/", "/image/lfw/")

  FACE_IMAGES_DIRS = sorted(listdir(FACE_IMAGES)) if path.isdir(FACE_IMAGES) else []

  LABELS = [d.split("-")[0] for d in FACE_IMAGES_DIRS if d[0] in string.ascii_letters]
  L2I = {v:i for i,v in enumerate(LABELS)}

  if len(FACE_IMAGES_DIRS) > 0:
    FACE_IMAGES_DIRS_PATH = path.join(FACE_IMAGES, FACE_IMAGES_DIRS[0])
    _first_img = [f for f in listdir(FACE_IMAGES_DIRS_PATH) if f.endswith(".jpeg") or f.endswith(".jpg")][0]
    IMAGE_SIZE = PImage.open(path.join(FACE_IMAGES_DIRS_PATH, _first_img)).size

  @staticmethod
  def train_test_split(test_pct=0.5, random_state=101010):
    seed(random_state)
    dataset = { k : { "pixels": [], "labels": [], "files": [] } for k in ["test", "train"] }
    label_files = { k : [] for k in dataset.keys() }

    for label in LFWUtils.LABELS:
      label_path = path.join(LFWUtils.FACE_IMAGES, label)
      label_files_all = [f for f in listdir(label_path) if f.endswith(".jpeg") or f.endswith(".jpg")]
      shuffle(label_files_all)
      split_idx = int(test_pct * len(label_files_all))
      label_files["test"] = label_files_all[:split_idx]
      label_files["train"] = label_files_all[split_idx:]

      for split in dataset.keys():
        for f in label_files[split]:
          img = PImage.open(path.join(label_path, f))
          img.pixels = list(img.getdata())

          pixel = img.pixels[0]
          if (type(pixel) == list or type(pixel) == tuple) and len(pixel) > 2:
            img.pixels = [sum(l[:3]) / 3 for l in img.pixels]

          dataset[split]["pixels"].append(img.pixels)
          dataset[split]["labels"].append(LFWUtils.L2I[label])
          dataset[split]["files"].append(f)

    return dataset["train"], dataset["test"]

  @staticmethod
  def top_precision(labels, predicted, top=5):
    labels_np = np.array(LFWUtils.LABELS)
    cm = confusion_matrix(labels, predicted)
    precision_sum = np.sum(cm, axis=0)
    precision = [c/t if t != 0 else 0 for c,t in zip(np.diagonal(cm), precision_sum)]
    top_idx = np.argsort(precision)
    top_precision = list(reversed(labels_np[top_idx]))
    return top_precision[:top]

  @staticmethod
  def top_recall(labels, predicted, top=5):
    labels_np = np.array(LFWUtils.LABELS)
    cm = confusion_matrix(labels, predicted)
    recall_sum = np.sum(cm, axis=1)
    recall = [c/t if t != 0 else 0 for c,t in zip(np.diagonal(cm), recall_sum)]
    top_idx = np.argsort(recall)
    top_recall = list(reversed(labels_np[top_idx]))
    return top_recall[:top]
