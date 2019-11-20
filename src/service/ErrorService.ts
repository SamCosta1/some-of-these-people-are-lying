import { Subject } from 'rxjs';
import { DisplayableError } from './models/Errors'

class ErrorService {
    errorStream = new Subject<DisplayableError>();

    pushError(title: string, error: any) {
        this.errorStream.next(new DisplayableError(
            title,
            error.message || 'Something went wrong'
        ));
    }
}

export default ErrorService;