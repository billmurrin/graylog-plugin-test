//eslint-disable-next-line no-unused-vars
import webpackEntry from 'webpack-entry';

import packageJson from '../../package.json'
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin'

import MachineLearningStartPage from 'machinelearning/component/MachineLearningStartPage'
import GraphPage from 'machinelearning/GraphPage'
import AnomalyDetectionPage from 'machinelearning/component/AnomalyDetectionPage'
import ForecastingPage from 'machinelearning/component/ForecastingPage'
import AnomalyDetectionCreatePage from 'machinelearning/component/AnomalyDetectionCreatePage'
import ForecastingCreatePage from 'machinelearning/component/ForecastingCreatePage'
import JobResultDisplay from 'machinelearning/component/JobResultDisplay'



const manifest = new PluginManifest(packageJson, {

  routes: [
    { path: '/analytics', component: MachineLearningStartPage },
    { path: '/analytics/anomaly', component: AnomalyDetectionPage },
    { path: '/analytics/anomaly/createjob', component: AnomalyDetectionCreatePage },
    { path: '/analytics/anomaly/jobresults/:jobid', component: JobResultDisplay },
    { path: '/analytics/forecasting', component: ForecastingPage },
    { path: '/analytics/forecasting/createjob', component: ForecastingCreatePage },
  ],

  navigation: [
    { path: '/analytics', description: 'Analytics' },
  ]

});
PluginStore.register(manifest);
