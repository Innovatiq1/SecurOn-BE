import rp  from "request-promise";
import OemModel from '../model/oemSchema.js';
var limit = 10;
const options = {
  url: 'https://alcatellucententerpriseeuropesandbox.org.coveo.com/rest/search/v2?organizationId=alcatellucententerpriseeuropesandbox',
  method: 'POST',
  headers: {
    'Accept-Language': 'en-US,en;q=0.5',
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzZWFyY2hIdWIiOiJBTEVfU2VhcmNoX0h1YiIsInY4Ijp0cnVlLCJ0b2tlbklkIjoidmRneGZsb2k0dTVuZ2JvZ2t1Z2QyZjJtdWUiLCJvcmdhbml6YXRpb24iOiJhbGNhdGVsbHVjZW50ZW50ZXJwcmlzZWV1cm9wZSIsInVzZXJJZHMiOlt7InR5cGUiOiJVc2VyIiwibmFtZSI6ImFub255bW91cyIsInByb3ZpZGVyIjoiRW1haWwgU2VjdXJpdHkgUHJvdmlkZXIifV0sInJvbGVzIjpbInF1ZXJ5RXhlY3V0b3IiXSwiaXNzIjoiU2VhcmNoQXBpIiwiZXhwIjoxNjk4Mzg5NzM3LCJpYXQiOjE2OTgzMDMzMzd9.I4Be8kaQrXu04DbSOrjI-m_GtC9wDVz9sbA7Udfh-GM',
  },
  body: {
    tab: 'resources',
    timezone: 'Asia/Kolkata',
    visitorId: 'b4b9aa44-a6e9-4722-a39e-b76b0f5551d5',
    fieldsToInclude: [
      'author',
      'language',
      'urihash',
      'objecttype',
      'collection',
      'source',
      'permanentid',
      'date',
      'filetype',
      'parents',
      'ec_price',
      'ec_name',
      'ec_description',
      'ec_brand',
      'ec_category',
      'ec_item_group_id',
      'ec_shortdesc',
      'ec_thumbnails',
      'ec_images',
      'ec_promo_price',
      'ec_in_stock',
      'ec_rating',
      'languagefacet',
      'assetpagedate',
      'siz122xe',
      'videoz32xduration',
      'contenttype',
      'contentsubtype',
      'productcategory',
      'industry',
      'solution',
      'articlecategories',
      'articletags',
      'z95xtemplatename',
      'isgated',
      'description',
      'valuez32xproposition',
      'sortabletitle',
      'header',
      'aapp',
      'id',
      'gatedassetformpage',
      'videoz32xurl',
      'articlez32xnb',
      'dspppartnerlevel',
      'region',
      'partnerlogo',
      'customername',
    ],
    q: '',
    enableQuerySyntax: false,
    searchHub: 'ALE_Search_Hub',
    sortCriteria: 'relevancy',
    analytics: {
      clientId: 'b4b9aa44-a6e9-4722-a39e-b76b0f5551d5',
      clientTimestamp: new Date().toISOString(),
      documentReferrer: 'default',
      originContext: 'Search',
      actionCause: 'interfaceLoad',
      customData: {
        coveoHeadlessVersion: '2.29.0',
        coveoAtomicVersion: '2.42.1',
      },
      documentLocation: 'https://www.al-enterprise.com/en/search#tab=resources&f-language=en&cf-contenttype-facet=Technical%20Documentation,Security%20advisory',
    },
    enableDidYouMean: true,
    facets: [
      {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: 'occurrences',
        type: 'specific',
        currentValues: [],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: 'region',
        field: 'region',
      },
      {
        delimitingCharacter: "/",
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 1,
        sortCriteria: "occurrences",
        basePath: [],
        filterByBasePath: true,
        currentValues: [
          {
            value: "Technical Documentation",
            retrieveCount: 5,
            children: [
              {
                value: "Security advisory",
                retrieveCount: 5,
                children: [],
                state: "selected",
                retrieveChildren: true
              }
            ],
            state: "idle",
            retrieveChildren: false
          }
        ],
        preventAutoSelect: false,
        type: "hierarchical",
        facetId: "contenttype-facet",
        field: "contenttype"
      },
      {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues:5,
        sortCriteria: "occurrences",
        type: "specific",
        currentValues: [
          {
            value: "en",
            state: "selected"
          }
        ],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: "language",
        field: "languagefacet"
      },
      {
        delimitingCharacter: "/",
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: "occurrences",
        basePath: [],
        filterByBasePath: true,
        currentValues: [],
        preventAutoSelect: false,
        type: "hierarchical",
        facetId: "productcategory-facet",
        field: "productcategory"
      },
      {
        delimitingCharacter: "/",
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: "occurrences",
        basePath: [],
        filterByBasePath: true,
        currentValues: [],
        preventAutoSelect: false,
        type: "hierarchical",
        facetId: "solution-facet",
        field: "solution"
      },
      {
        delimitingCharacter: "/",
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: "occurrences",
        basePath: [],
        filterByBasePath: true,
        currentValues: [],
        preventAutoSelect: false,
        type: "hierarchical",
        facetId: "industry-facet",
        field: "industry"
      },
      {
        delimitingCharacter: "/",
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: "occurrences",
        basePath: [],
        filterByBasePath: true,
        currentValues: [],
        preventAutoSelect: false,
        type: "hierarchical",
        facetId: "customer-country-facet",
        field: "customername"
      },
    ],
    numberOfResults: limit,
    firstResult: 0,
    facetOptions: {
      freezeFacetOrder: false,
    },
  },
  json: true,
};

const maxRetries = 10;
var regex;

export const RunAlcatelWebScraping = async () => {


  async function fetchDataWithRetries(url, retries = maxRetries) {
    try {
      console.log('url-------------', JSON.stringify(url));
      await sleep(5000);
      const html = await rp(url);
      return html;
    } catch (error) {
      if (retries > 0) {
        console.log(error);
        console.log(`Retrying request. Retries left: ${retries}`);
        await sleep(1000);
        return fetchDataWithRetries(url, retries - 1);
      } else {
        throw new Error('Maximum retries reached. Unable to fetch data.');
      }
    }
  }
  
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  
  async function processPages() {
    const jsonData = await fetchDataWithRetries(options);
    if (jsonData) {
      await processJsonData(jsonData.results);
      options.body.numberOfResults = jsonData.totalCount;
      options.body.firstResult = limit;
      const jsonData2 = await fetchDataWithRetries(options);
      if(jsonData2){
        await processJsonData(jsonData2.results);
      }
    } else {
      console.log('Main page is empty');
    }
  }
  
  async function processJsonData(data) {
    if (data) {
      for (const i of data) {
        console.log("title ----- ", i.raw.sortabletitle+'\n');
        console.log('link ----- ', i.ClickUri+'\n');
      }
    }
    
  }
  
  processPages()
    .then(() => {
      console.log('Scrapping completed.');
    })
    .catch((err) => {
      console.log('Error:', err);
    });
  
  

}