export default class MockMutationObserver {
    observe() {
    }
}

export class MockXHR {

    constructor() {
        this.response = undefined;
    }

    get response() {
        return JSON.stringify(this.__response);
    }

    get status() {
        return 200;
    }

    set response(value) {
        this.__response = value;
    }

    get readyState() {
        return 4;
    }

    set onload(callback) {
        this.__callback = callback;
    }

    setRequestHeader() {
    }

    send() {
        this.__callback();
    }

    open(method, url) {
        if (url.indexOf('screen_name=error') > 0) {
            this.__response = undefined;
        }
        if (url.indexOf('screen_name=jack') > 0) {
            this.__response = MockResponses.bio;
        }
    }
}

const MockResponses = {
    bio: [{
        'id': 12,
        'id_str': '12',
        'name': 'jack',
        'screen_name': 'jack',
        'location': '',
        'description': '#bitcoin',
        'url': null,
        'entities': {'description': {'urls': []}},
        'protected': false,
        'followers_count': 5578267,
        'fast_followers_count': 0,
        'normal_followers_count': 5578267,
        'friends_count': 4776,
        'listed_count': 29677,
        'created_at': 'Tue Mar 21 20:50:14 +0000 2006',
        'favourites_count': 34517,
        'utc_offset': null,
        'time_zone': null,
        'geo_enabled': true,
        'verified': true,
        'statuses_count': 27650,
        'media_count': 2834,
        'lang': null,
        'contributors_enabled': false,
        'is_translator': false,
        'is_translation_enabled': false,
        'profile_background_color': 'EBEBEB',
        'profile_background_image_url': 'http:\/\/abs.twimg.com\/images\/themes\/theme7\/bg.gif',
        'profile_background_image_url_https': 'https:\/\/abs.twimg.com\/images\/themes\/theme7\/bg.gif',
        'profile_background_tile': false,
        'profile_image_url': 'http:\/\/pbs.twimg.com\/profile_images\/1115644092329758721\/AFjOr-K8_normal.jpg',
        'profile_image_url_https': 'https:\/\/pbs.twimg.com\/profile_images\/1115644092329758721\/AFjOr-K8_normal.jpg',
        'profile_banner_url': 'https:\/\/pbs.twimg.com\/profile_banners\/12\/1584998840',
        'profile_link_color': '990000',
        'profile_sidebar_border_color': 'DFDFDF',
        'profile_sidebar_fill_color': 'F3F3F3',
        'profile_text_color': '333333',
        'profile_use_background_image': true,
        'has_extended_profile': true,
        'default_profile': false,
        'default_profile_image': false,
        'pinned_tweet_ids': [1247616214769086465],
        'pinned_tweet_ids_str': ['1247616214769086465'],
        'has_custom_timelines': true,
        'following': null,
        'follow_request_sent': null,
        'notifications': null,
        'advertiser_account_type': 'promotable_user',
        'advertiser_account_service_levels': [],
        'business_profile_state': 'none',
        'translator_type': 'regular',
        'withheld_in_countries': [],
        'require_some_consent': false
    }],
};
