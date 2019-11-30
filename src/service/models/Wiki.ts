export interface WikiArticle {
    title: string,
    url: string
}

export interface RawWikiArtice {
    type:          string;
    title:         string;
    displaytitle:  string;
    namespace:     Namespace;
    wikibase_item: string;
    titles:        Titles;
    pageid:        number;
    thumbnail:     Originalimage;
    originalimage: Originalimage;
    lang:          string;
    dir:           string;
    revision:      string;
    tid:           string;
    timestamp:     string;
    description:   string;
    content_urls:  ContentUrls;
    api_urls:      APIUrls;
    extract:       string;
    extract_html:  string;
}

export interface APIUrls {
    summary:        string;
    metadata:       string;
    references:     string;
    media:          string;
    edit_html:      string;
    talk_page_html: string;
}

export interface ContentUrls {
    desktop: URLInfo;
    mobile:  URLInfo;
}

export interface URLInfo {
    page:      string;
    revisions: string;
    edit:      string;
    talk:      string;
}

export interface Namespace {
    id:   number;
    text: string;
}

export interface Originalimage {
    source: string;
    width:  number;
    height: number;
}

export interface Titles {
    canonical:  string;
    normalized: string;
    display:    string;
}
