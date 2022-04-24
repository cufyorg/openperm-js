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
