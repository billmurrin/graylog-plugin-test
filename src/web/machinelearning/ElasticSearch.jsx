
import elasticsearch from 'elasticsearch';
import AggregatesActions from './AggregatesActions';


import CombinedProvider from 'injection/CombinedProvider';
const { UniversalSearchStore } = CombinedProvider.get('UniversalSearch');


// const promise = UniversalSearchStore.search('absolute', '*', searchParams, this.props.stream.id, this.PAGE_SIZE,
//   page || 1, 'timestamp', 'asc', undefined, false);
const client = new elasticsearch.Client({
  host: '104.198.76.27:9200'
});

export default client;
