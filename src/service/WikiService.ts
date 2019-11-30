import {RawWikiArtice, WikiArticle} from "./models/Wiki";
import {BehaviorSubject} from "rxjs/internal/BehaviorSubject";

class WikiService {
    article = new BehaviorSubject<WikiArticle | null>(null);

    constructor() {
        this.fetchArticle()
    }

    fetchArticle(): Promise<WikiArticle> {
         return fetch("https://en.wikipedia.org/api/rest_v1/page/random/summary")
            .then(response =>  response.json() as Promise<RawWikiArtice>)
             .then(rawArticle => {
                return {
                    title: rawArticle.title,
                    url: rawArticle.content_urls.mobile.page
                }
            }).then(article => {
                this.article.next(article);
                return article
             })
    }
}

export default WikiService;