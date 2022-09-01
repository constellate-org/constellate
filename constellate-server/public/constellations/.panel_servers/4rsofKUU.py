# This code is autogenerated by Constellate, and changes made here will not persist.
#constellate: setup
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import colorcet as cc
import scipy
from sympy import *
import rho_plus

IS_DARK = True
theme, cs = rho_plus.mpl_setup(IS_DARK)

import panel as pn
import param
import bokeh
pn.extension('gridstack', sizing_mode='scale_both')
from panel.layout.gridstack import GridStack
#constellate: setup_panel

from bokeh.sampledata.iris import flowers
from rho_plus.util import labelcase
import holoviews as hv
from holoviews import opts

flowers.columns = labelcase(flowers.columns)

import param
from scipy import stats


class Gaussian(param.Parameterized):
    mu_x = param.Number(label='Mean petal width', default=0.2, bounds=(0, 3))
    mu_y = param.Number(label='Mean petal length', default=0.2, bounds=(0, 7))
    sigma_x = param.Number(label='Petal width standard deviation',
                           default=1,
                           bounds=(0, 2))
    sigma_y = param.Number(label='Petal length standard deviation',
                           default=1,
                           bounds=(0, 4))
    sigma_xy = param.Number(label='Petal width/length correlation',
                            default=0,
                            bounds=(-1, 1),
                            step=0.01)

    @pn.depends('mu_x', 'mu_y', 'sigma_x', 'sigma_y', 'sigma_xy')
    def generate_pdf(self, xy):
        mu = np.array([self.mu_x, self.mu_y])
        sigma_cov = self.sigma_x * self.sigma_y * self.sigma_xy
        sigma = np.array([[self.sigma_x, sigma_cov], [sigma_cov,
                                                      self.sigma_y]])

        return stats.multivariate_normal(mu, sigma,
                                         allow_singular=True).pdf(xy)


class GMMTest(rho_plus.ThemedPanel):
    clust1 = Gaussian()
    clust2 = Gaussian()

    p1 = param.Number(label='Proportion in cluster 1',
                      default=0.5,
                      bounds=(0, 1),
                      step=0.01)

    def __init__(self):
        super().__init__()
        self.clust2.mu_x = 3
        self.clust2.mu_y = 5

    @pn.depends('clust1.param', 'clust2.param', 'p1')
    def generate_pdf(self, xy):
        return self.clust1.generate_pdf(
            xy).T * self.p1 + self.clust2.generate_pdf(xy).T * (1 - self.p1)

    @pn.depends('clust1.param', 'clust2.param', 'p1', 'colorMode')
    def plot(self):
        colors, theme = self.colors_theme()
        hv.Cycle.default_cycles['default_colors'] = colors
        hv.renderer('bokeh').theme = theme

        xx, yy = np.mgrid[0:3.5:0.05, 0:7:0.1]
        xy = np.dstack([xx, yy])

        cmap = rho_plus.umbra
        if self.colorMode != 'light':
            cmap = cmap.rev()

        img = hv.operation.contours(hv.Image(
            (xx[:, 0], yy[0], self.generate_pdf(xy))),
                                    levels=8,
                                    filled=True).opts(cmap=cmap.as_mpl_cmap(),
                                                      xlabel='Petal Width',
                                                      ylabel='Petal Length',
                                                      responsive=True)

        pdf = hv.QuadMesh((xx, yy, self.generate_pdf(xy))).opts(
            opts.QuadMesh(cmap=rho_plus.viridia.as_mpl_cmap(),
                          colorbar=True,
                          clim=(0, 0.3),
                          line_width=5,
                          xlabel='Petal Width',
                          ylabel='Petal Length'))
        points = hv.Points(flowers,
                           kdims=['Petal Width', 'Petal Length']).opts(
                               opts.Points(
                                   color=colors[0],
                                   size=8,
                                   xlim=(np.min(xx), np.max(xx)),
                                   ylim=(np.min(yy), np.max(yy)),
                                   responsive=True,
                               ))
        plot = img * points
        return pn.pane.HoloViews(plot, sizing_mode='stretch_both')


mod = GMMTest()
obj = pn.GridSpec(sizing_mode='stretch_both')
obj[:, :1] = pn.Column(
    pn.Param(mod, sizing_mode='stretch_both', name='Cluster Size'),
    pn.Param(mod.clust1, name='Cluster 1'),
    pn.Param(mod.clust2, name='Cluster 2'))
obj[:, 1:5] = pn.Column(mod.plot, sizing_mode='stretch_both')
obj[:, 5:6] = pn.Spacer()
obj.servable()