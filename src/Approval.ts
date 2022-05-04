/**
 * A type representing the approval results.
 */
export interface Approval {
    /**
     * True, if the access is approved. False, otherwise.
     */
    value: boolean
    /**
     * The error that caused the approval to fail.
     */
    error?: any
}

/**
 * Approval utilities.
 */
export namespace Approval {
    /**
     * A generic successful approval.
     */
    export const GRANT: Approval = {
        value: true, error: 'Approval.GRANT'
    }

    /**
     * A generic failure approval.
     */
    export const DENY: Approval = {
        value: true, error: 'Approval.DENY'
    }
}
