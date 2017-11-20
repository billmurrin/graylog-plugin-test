//eslint-disable-next-line no-unused-vars
import webpackEntry from 'webpack-entry';

import packageJson from '../../package.json'
import { PluginManifest, PluginStore } from 'graylog-web-plugin/plugin'

import MachineLearningPage from 'machinelearning/MachineLearningPage'
import GraphPage from 'machinelearning/GraphPage'
import SchedulesPage from 'machinelearning/SchedulesPage'

const manifest = new PluginManifest(packageJson, {

  routes: [
    { path: '/machineLearning', component: MachineLearningPage },
  ],

  navigation: [
    { path: '/machineLearning', description: 'Machine learning' },
  ]

});
PluginStore.register(manifest);
