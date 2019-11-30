import { Subject } from 'rxjs';
import {RawWikiArtice, WikiArticle} from "./models/Wiki";

class WikiService {
    article = new Subject<WikiArticle>();

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