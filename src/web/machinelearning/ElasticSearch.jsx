
import AggregatesActions from './AggregatesActions';

import AppConfig from 'util/AppConfig';
import CombinedProvider from 'injection/CombinedProvider';
const { UniversalSearchStore } = CombinedProvider.get('UniversalSearch');


var hostname = AppConfig.gl2ServerUrl().split("9000")[0]+"9200";
