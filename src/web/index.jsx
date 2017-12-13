//eslint-disable-next-line no-unused-vars
import webpackEntry from 'webpack-entry';

import packageJson from '../../package.json'
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin'

import MachineLearningPage from 'machinelearning/MachineLearningPage'
import MachineLearningStartPage from 'machinelearning/component/MachineLearningStartPage'
import GraphPage from 'machinelearning/GraphPage'
import SchedulesPage from 'machinelearning/SchedulesPage'
import AnomalyDetectionPage from 'machinelearning/component/AnomalyDetectionPage'
import ForecastingPage from 'machinelearning/component/ForecastingPage'
import AnomalyDetectionCreatePage from 'machinelearning/component/AnomalyDetectionCreatePage'
import ForecastingCreatePage from 'machinelearning/component/ForecastingCreatePage'



const manifest = new PluginManifest(packageJson, {

  routes: [
    { path: '/machineLearning', component: MachineLearningStartPage },
    { path: '/machineLearning/anomaly', component: AnomalyDetectionPage },
    { path: '/machineLearning/anomaly/createjob', component: AnomalyDetectionCreatePage },
    { path: '/machineLearning/forecasting', component: ForecastingPage },
    { path: '/machineLearning/forecasting/createjob', component: ForecastingCreatePage },
  ],

  navigation: [
    { path: '/machineLearning', description: 'Machine learning' },
  ]

});
PluginStore.register(manifest);
