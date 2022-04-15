/**
 * A role is permission location or specification that can be used to isolate
 * the permission verification process from the interfaces `permission` and
 * `privilege`.
 */
export interface Role {
    /**
     * The error to be passed when this role is not met.
     */
    error?: any;
}
