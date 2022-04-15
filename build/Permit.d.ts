import { Role } from "./Role";
import { Privilege } from "./Privilege";
import { Approval } from "./Approval";
/**
 * The types of the results of a permit evaluation.
 */
export declare type PermitResult<T = any, R extends Role = Role> = R | Permit<T, R>[];
/**
 * The types of a permit output.
 */
export declare type PermitOutput<T = any, R extends Role = Role> = Promise<PermitResult<T, R>> | PermitResult<T, R>;
/**
 * The type of a permit function.
 */
export declare type PermitFunction<T = any, R extends Role = Role> = (target: T) => PermitOutput<T, R>;
/**
 * A permit is a function responsible for creating a set of roles for a target.
 */
export declare type Permit<T = any, R extends Role = Role> = PermitOutput<T, R> | PermitFunction<T, R>;
/**
 * Check the given permit and throw the error if it fails.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 */
export declare function requirePermit<T = any, R extends Role = Role, A extends Approval = Approval>(permit: Permit<T, R>, privilege: Privilege<R, A>, target: T): Promise<T>;
/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permitted the given permit for the given target.
 */
export declare function isPermitted<T = any, R extends Role = Role, A extends Approval = Approval>(permit: Permit<T, R>, privilege: Privilege<R, A>, target: T): Promise<boolean>;
/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return an approval object.
 */
export declare function checkPermit<T = any, R extends Role = Role, A extends Approval = Approval>(permit: Permit<T, R>, privilege: Privilege<R, A>, target: T): Promise<A>;
/**
 * Evaluate the given permits
 *
 * @param permit the permit to be evaluated.
 * @param target the target to evaluate the permit for.
 * @return the roles to test when checking the permit.
 */
export declare function invokePermit<T = any, R extends Role = Role>(permit: Permit<T, R>, target: T): Promise<R[]>;
export declare namespace Permit {
    /**
     * Create a permit that returns the result of invoking the given permit with
     * the target being the result of invoking the given mapper with the target given to it.
     */
    function map<T = any, U = any, R extends Role = Role>(permit: Permit<U, R>, mapper: (target: T) => U | Promise<U>): Permit<T, R>;
}
