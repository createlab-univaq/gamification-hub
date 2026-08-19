import type {Language} from "../../../utils/lng-utils.ts";
import {BaseApiClient} from "../base-client.ts";

export class DocsClient extends BaseApiClient {

    protected async sendRequest<T>(url: RequestInfo | URL, options?: RequestInit): Promise<T> {
        return super.sendRequest<T>(url, {...options, credentials: "omit"});
    }

    public async getGuideChapter(chapter: string, language: Language) {
        return await this.get<string>(`/${chapter}-guide.${language}.md`);
    }

}
