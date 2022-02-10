import { notify } from '../lib/notify.js';


export default function initialize() {
    return function(ctx, next) {
        ctx.notify = notify;

        next();
    };
}