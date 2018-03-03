// let endpoint = 'http://192.168.90.111:8000/api/';
// let endpoint = 'http://192.168.1.100:8000/api/';
let endpoint = 'https://api.solotodo.com/';
// let endpoint = 'http://local.solotodo.com:8000/';
// let endpoint = 'http://api.solotodo.com:8000/';

export const apiSettings = {
  endpoint,
  apiResourceEndpoints: {
    stores: endpoint + 'stores/',
    languages: endpoint + 'languages/',
    store_types: endpoint + 'store_types/',
    number_formats: endpoint + 'number_formats/',
    currencies: endpoint + 'currencies/',
    countries: endpoint + 'countries/',
    categories: endpoint + 'categories/',
    store_update_logs: endpoint + 'store_update_logs/',
    entities: endpoint + 'entities/',
    entity_histories: endpoint + 'entity_histories/',
    users: endpoint + 'users/',
    users_with_staff_actions: endpoint + 'users/with_staff_actions/',
    products: endpoint + 'products/',
    category_templates: endpoint + 'category_templates/',
    leads: endpoint + 'leads/',
    visits: endpoint + 'visits/',
    reports: endpoint + 'reports/',
    websites: endpoint + 'websites/',
    category_specs_form_layouts: endpoint + 'category_specs_form_layouts/',
    wtb_brands: endpoint + 'wtb/brands/',
    wtb_brand_update_logs: endpoint + 'wtb/brand_update_logs/',
    wtb_entities: endpoint + 'wtb/entities/',
    category_columns: endpoint + 'category_columns/',
    budgets: endpoint + 'budgets/',
  },
  ownUserUrl: endpoint + 'users/me/',
  linioStoreId: 76,
  linioAffiliateId: 2900,
  cellPhoneCategoryId: 6,
  technicalSpecificationsPurposeId: 1,
  categoryBrowseResultPurposeUrl: endpoint + 'category_template_purposes/3/',
  shortDescriptionPurposeUrl: endpoint + 'category_template_purposes/2/',
  detailPurposeUrl: endpoint + 'category_template_purposes/1/',
  usdCurrencyId: 4,
  backendUrl: 'https://backend.solotodo.com/',
};
