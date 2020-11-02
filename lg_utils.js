import settings from "../settings";

export function googleAnalyticsParamValues(wtbEntity, product, category, source) {
    const params = {
        productName: product.name,
        categoryName: category.name,
        source
    };

    if (wtbEntity) {
        params.model = wtbEntity.model_name ? wtbEntity.model_name.split('.')[0] : wtbEntity.name.split(' - ')[0]
        params.modelWithSuffix = wtbEntity.model_name || 'N/A'
        params.identifier = wtbEntity.key;

        const section = wtbEntity.section || '';
        const pageCategoryLevels = section.split(' > ');

        for (let i = 0; i < 3; i++) {
            params['pageCategoryL' + (i + 1)] = pageCategoryLevels[i] || 'N/A'
        }
    } else {
        params.model = 'N/A'
        params.modelWithSuffix = 'N/A'
        params.identifier = 'N/A';

        for (let i = 0; i < 3; i++) {
            params['pageCategoryL' + (i + 1)] = 'N/A'
        }
    }

    const categoryMetadata = settings.categoryMetadata[category.id] || {};
    const categoryAnalyticsSpecsFields = categoryMetadata.analyticsSpecDimensions || [];

    categoryAnalyticsSpecsFields.forEach((field, idx) => {
        params['spec' + (idx+1)] = product.specs[field];
    })

    return params
}

export function generateAnalyticsParams(analyticsParamsValues, analyticsSettings) {
    const params = {
        send_to: analyticsSettings.id
    }
    for (const field of Object.keys(analyticsSettings.mapping)) {
        const paramValue = analyticsParamsValues[field]
        if (!paramValue) {
            continue
        }
        const dimensionIndex = analyticsSettings.mapping[field];
        params['dimension' + dimensionIndex] = paramValue
    }
    return params
}