"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Permission = exports.invokePermission = exports.checkPermission = exports.isPermissioned = exports.requirePermission = void 0;
const Permit_1 = require("./Permit");
// Static
/**
 * Check the given permission and throw the error if it fails.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 */
function requirePermission(permission, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const approval = yield checkPermission(permission, privilege, target);
        if (!approval.value)
            throw approval.error;
        return target;
    });
}
exports.requirePermission = requirePermission;
/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permissioned the given permission for the given target.
 */
function isPermissioned(permission, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const approval = yield checkPermission(permission, privilege, target);
        return approval.value;
    });
}
exports.isPermissioned = isPermissioned;
/**
 * Check the given permission.
 *
 * @param permission the permission to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permission for.
 * @return an approval object.
 */
function checkPermission(permission, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const approvals = yield invokePermission(permission, privilege, target);
        if (approvals.length === 0)
            return { value: false };
        for (const approval of approvals)
            if (!approval.value)
                return approval;
        return approvals[0];
    });
}
exports.checkPermission = checkPermission;
/**
 * Evaluate the given permission.
 *
 * @param permission the permission to be evaluated.
 * @param privilege the privilege
 * @param target the target to evaluate the permission for.
 * @return the approval objects.
 */
function invokePermission(permission, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        // Promise<PermissionResult>
        if (permission instanceof Promise)
            return invokePermission(yield permission, privilege, target);
        // Permission[]
        if (Array.isArray(permission))
            return Promise
                .all(permission.map(it => invokePermission(it, privilege, target)))
                .then(it => it.flatMap(it => it));
        // Approval
        if (typeof permission === 'object')
            return [permission];
        // PermissionFunction
        if (typeof permission === 'function')
            return invokePermission(yield permission(privilege, target), privilege, target);
        throw new Error('Invalid Permission Type');
    });
}
exports.invokePermission = invokePermission;
// Util
/**
 * Permission static utilities.
 */
var Permission;
(function (Permission) {
    /**
     * Return a permission that checks the given `permissions`.
     *
     * If the permissions array is empty, the returned permission will always
     * evaluate to `true`.
     *
     * If at least one permission evaluates to false, the permission will
     * evaluate to `false`.
     *
     * If at least one permission doesn't emit an approval, the permission will
     * evaluate to `false`.
     */
    function every(...permissions) {
        return (privilege, target) => __awaiter(this, void 0, void 0, function* () {
            for (const permission of permissions) {
                const approvals = yield invokePermission(permission, privilege, target);
                if (approvals.length === 0)
                    return { value: false };
                for (const approval of approvals)
                    if (!approval.value)
                        return approval;
            }
            return { value: true };
        });
    }
    Permission.every = every;
    /**
     * Return a permission that checks the given `permissions`.
     *
     * If the permissions array is empty, the returned permission will always
     * evaluate to `false`.
     *
     * If at least one permission evaluates to true, the permission will
     * evaluate to `true`.
     */
    function some(...permissions) {
        return (privilege, target) => __awaiter(this, void 0, void 0, function* () {
            for (const permission of permissions) {
                const approvals = yield invokePermission(permission, privilege, target);
                for (const approval of approvals)
                    if (approval.value)
                        return approval;
            }
            return { value: false };
        });
    }
    Permission.some = some;
    /**
     * Create a new permission that returns the result of invoking the given
     * permission with the target being the result of invoking the given mapper
     * with the target given to it.
     */
    function map(permission, mapper) {
        return (privilege, target) => __awaiter(this, void 0, void 0, function* () { return invokePermission(permission, privilege, yield mapper(target)); });
    }
    Permission.map = map;
    /**
     * Create a permission that returns the result of checking the given permit.
     */
    function create(permit) {
        return (privilege, target) => (0, Permit_1.checkPermit)(permit, privilege, target);
    }
    Permission.create = create;
})(Permission = exports.Permission || (exports.Permission = {}));
