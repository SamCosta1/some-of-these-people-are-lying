import React from 'react';
import Injector from "../../../service/Injector";
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { DisplayableError } from '../../../service/models/Errors';

export class ErrorHandlerComponent extends React.Component<any, any> {

    private subscriptions: Subscription[] = [];

    componentDidMount() {

        const errorSub = Injector.instance().errorService.errorStream
            .subscribe(error => this.displayError(error));

        this.subscriptions.push(errorSub);
    }

    private displayError(error: DisplayableError) {
        console.error(error);
        Swal.fire({
            title: error.title,
            text: error.body,
            icon: 'error',
            confirmButtonText: "Oh well..."
        });
    }

    render() { return null }
}