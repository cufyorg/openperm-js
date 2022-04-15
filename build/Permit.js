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
exports.Permit = exports.invokePermit = exports.checkPermit = exports.isPermitted = exports.requirePermit = void 0;
const Privilege_1 = require("./Privilege");
// Static
/**
 * Check the given permit and throw the error if it fails.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 */
function requirePermit(permit, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const approval = yield checkPermit(permit, privilege, target);
        if (!approval.value)
            throw approval.error;
        return target;
    });
}
exports.requirePermit = requirePermit;
/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return true, if the privilege is permitted the given permit for the given target.
 */
function isPermitted(permit, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const approval = yield checkPermit(permit, privilege, target);
        return approval.value;
    });
}
exports.isPermitted = isPermitted;
/**
 * Check the given permit.
 *
 * @param permit the permit to be checked.
 * @param privilege the privilege.
 * @param target the target to check the permit for.
 * @return an approval object.
 */
function checkPermit(permit, privilege, target) {
    return __awaiter(this, void 0, void 0, function* () {
        const roles = yield invokePermit(permit, target);
        if (roles.length === 0)
            return { value: false };
        for (const role of roles) {
            const approvals = yield (0, Privilege_1.invokePrivilege)(privilege, role);
            if (approvals.length === 0)
                return { value: false, error: role.error };
            for (const approval of approvals)
                if (!approval.value)
                    return approval;
        }
        return { value: true };
    });
}
exports.checkPermit = checkPermit;
/**
 * Evaluate the given permits
 *
 * @param permit the permit to be evaluated.
 * @param target the target to evaluate the permit for.
 * @return the roles to test when checking the permit.
 */
function invokePermit(permit, target) {
    return __awaiter(this, void 0, void 0, function* () {
        // Promise<PermitResult>
        if (permit instanceof Promise)
            return invokePermit(yield permit, target);
        // Permit[]
        if (Array.isArray(permit))
            return Promise
                .all(permit.map(it => invokePermit(it, target)))
                .then(it => it.flatMap(it => it));
        // Result
        if (typeof permit === 'object')
            return [permit];
        // PermitFunction
        if (typeof permit === 'function')
            return invokePermit(yield permit(target), target);
        throw new Error('Invalid Permit Type');
    });
}
exports.invokePermit = invokePermit;
// Util
var Permit;
(function (Permit) {
    /**
     * Create a permit that returns the result of invoking the given permit with
     * the target being the result of invoking the given mapper with the target given to it.
     */
    function map(permit, mapper) {
        return (target) => __awaiter(this, void 0, void 0, function* () { return invokePermit(permit, yield mapper(target)); });
    }
    Permit.map = map;
})(Permit = exports.Permit || (exports.Permit = {}));
