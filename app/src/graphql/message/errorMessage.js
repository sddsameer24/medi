var APPOLOERROR = require("apollo-errors");
const { createError } = APPOLOERROR;

const AuthenticationError = createError("WrongCredentialsError", {
    message: "Authentication required"
});

const DataMissing = createError("DataMissingError", {
    message: "Data Missing required"
});

const NotOtherisedUserError = createError("NotOtherisedUserError", {
    message: "Not autherised user"
});

const InternalServerError = createError("ServerError", {
    message: "Internal server error"
});

const DataNotFoundError = createError("DataNotFound", {
    message: "Data not found"
});

const NotActivateAccount = createError("NotActivateAccount", {
    message: "Account Not Activated"
});

const Progress = createError("Progress", {
    message: "Progress"
});
const NotAddYett = createError("NotAddYet", {
    message: "NotAddYet"
});

module.exports = { AuthenticationError, DataMissing, InternalServerError, NotOtherisedUserError, Progress, NotAddYett, DataNotFoundError, NotActivateAccount }