/**
 * Created by hunte on 06/06/2016.
 */
/**
 * @ngdoc overview
 * @name prntSvcs
 * @description Module containing print service and helper functions
 */
var prntSvcs = angular.module("prntSvcs", []);
/**
 * @ngdoc service
 * @name prntSvcs.printer
 * @description Providing a function to print a html-template
 */
prntSvcs.factory('printer', ['$rootScope', '$compile', '$http', '$timeout', '$q', function ($rootScope, $compile, $http, $timeout, $q) {
    /**
     * @ngdoc function
     * @name prntSvcs.printer#printHtml
     * @param {object} html a compiled html-template
     * @methodOf prntSvcs.printer
     * @description Prints the passed html template. Only used internally
     */
    var printHtml = function (html) {
        var mywindow = window.open();
        mywindow.document.write(html);
        mywindow.print();
        mywindow.close();
        return true;
    };

    /**
     * @ngdoc function
     * @name prntSvcs.printer#print
     * @methodOf prntSvcs.printer
     * @description compiles the passed template file and the given data and prints the result
     * @param {string} templateUrl URL to the template to be rendered
     * @param {object} data data to be rendered in the template
     */
    var print = function (templateUrl, data, workshop) {
        $http.get(templateUrl).success(function (template) {
            var printScope = $rootScope.$new();
            var _data = {
                data: {
                    participants: data,
                    workshop: workshop
                }
            };
            angular.extend(printScope, _data);
            var element = $compile($('<div>' + template + '</div>'))(printScope);
            var waitForRenderAndPrint = function () {
                if (printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(waitForRenderAndPrint);
                } else {
                    printHtml(element.html());
                    printScope.$destroy();
                }
            };
            waitForRenderAndPrint();
        });
    };
    /**
     * @ngdoc function
     * @name prntSvcs.printer#printFromScope
     * @methodOf prntSvcs.printer
     * @description compiles the passed template file and the given scope and prints the result
     * @param {string} templateUrl URL to the template to be rendered
     * @param {object} scope The scope where the data to be rendered in the template is located
     */
    var printFromScope = function (templateUrl, scope) {
        $rootScope.isBeingPrinted = true;
        $http.get(templateUrl).success(function (template) {
            var printScope = scope;
            var element = $compile($('<div>' + template + '</div>'))(printScope);
            var waitForRenderAndPrint = function () {
                if (printScope.$$phase || $http.pendingRequests.length) {
                    $timeout(waitForRenderAndPrint);
                } else {
                    printHtml(element.html()).then(function () {
                        $rootScope.isBeingPrinted = false;
                    });

                }
            };
            waitForRenderAndPrint();
        });
    };
    return {
        'print': print,
        'printFromScope': printFromScope
    }
}]);

/**
 * @name restSvcs
 * @requires ngResource
 * @description Module containing the REST services. The received objects properties can be taken from the REST-Api documentation
 */
var restSvcs = angular.module('restSvcs', ['ngResource']);

/**
 * @ngdoc service
 * @name restSvcs.Workshops
 * @description Provides CRUD operations for Workshop-functions provided by the API. All functions return a $promise object resolved with the requested data
 */
restSvcs.factory('Workshops', ['$resource', function ($resource) {
    return $resource('/api/workshops/:id', {}, {
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#getAll
         * @description get a list of all currently available workshops.
         * @methodOf restSvcs.Workshops
         * @returns { Array<Workshop>} List of workshops
         */
        'getAll': {method: 'GET', params: {id: 'all'}, isArray: true},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#get
         * @description get a single workshops
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         */
        'getWorkshop': {method: 'GET', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#getParticipants
         * @description get list of enrolled participants to a workshop
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         */
        'getParticipants': {method: 'GET', url: '/api/workshops/:id/participants', params: {id: '@id'}, isArray: true},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#enrollWorkshop
         * @description Action to enroll a Workshop
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         */
        'enroll': {method: 'POST', url: '/api/workshops/:id/enroll', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#unsubscribeWorkshop
         * @description Action to unsubscribe a Workshop
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         * @param {string} token Unsubscribetoken
         */
        'unsubscribe': {method: 'POST', url: '/api/workshops/unsubscribe', isArray: false},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#unsubscribeWorkshop
         * @description Get Waitinglist of a Workshop
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         */
        'getWaitinglist': {method: 'GET', url: '/api/workshops/:id/waitinglist', params: {id: '@id'}, isArray: true},
        /**
         * @ngdoc funtion
         * @name restSvcs.Workshops#unsubscribeWorkshop
         * @description Confirm Enrollment of the WOrkshop
         * @methodOf restSvcs.Workshops
         * @param {number} id Workshop-ID
         * @param {number} participantsid Participants-ID
         * @param {string} token Confirmtoken
         */
        'confirmEnroll': {method: 'GET', url: '/api/workshops/:id/enroll/:userid/confirm/:token', params: {id: '@id', userid: '@userid', token: '@token'}, isArray: false},
        'unsubscribeConfirm': {method: 'GET', url: '/api/workshops/:id/unsubscribe/:token/confirmation/:participantId'}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.WorkshopTemplate
 * @description Provides CRUD operations for Workshop-Template-functions provided by the API
 */
restSvcs.factory('WorkshopTemplate', ['$resource', function ($resource) {
    return $resource('/api/admin/workshops/template/:id', {}, {
        /**
         * @ngdoc funtion
         * @name restSvcs.WorkshopTemplate#getAll
         * @description get a list of all currently available workshoptemplates.
         * @methodOf restSvcs.WorkshopTemplate
         * @returns {httpPromise} resolve with fetched data, or fails with error description.
         */
        'getAll': {method: 'GET', params: {id: 'list'}, isArray: true},
        /**
         * @ngdoc funtion
         * @name restSvcs.WorkshopTemplate#get
         * @description get a single workshoptemplate
         * @methodOf restSvcs.WorkshopTemplate
         * @param {integer} id Workshop-ID
         */
        'get': {method: 'GET', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.WorkshopTemplate#edit
         * @description edit a single workshoptemplate
         * @methodOf restSvcs.WorkshopTemplate
         * @param {integer} id Workshop-ID
         */
        'edit': {method: 'PATCH', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.WorkshopTemplate#put
         * @description create a new workshoptemplate
         * @methodOf restSvcs.WorkshopTemplate
         */
        'put': { method: 'PUT', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.WorkshopTemplate#delete
         * @description delete a workshoptemplate
         * @methodOf restSvcs.WorkshopTemplate
         * @param {integer} id Workshop-ID
         */
        'deleteWorkshopTemplate': {method: 'DELETE', params: {id: '@id'}, isArray: false}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.AdminWorkshop
 * @description Provides CRUD operations for Admin-Workshop-functions provided by the API
 */
restSvcs.factory('AdminWorkshop', ['$resource', function ($resource) {
    return $resource('/api/admin/workshops/:id', {}, {
        /**
         * @ngdoc function
         * @name restSvcs.AdminWorkshop#gethistory
         * @description show all workshops
         * @methodOf restSvcs.AdminWorkshop
         * @returns {httpPromise} resolve with fetched data, or fails with error description.
         */
        'gethistory': {method: 'GET', params: {id: 'history'}, isArray: true},
        /**
         * @ngdoc function
         * @name restSvcs.AdminWorkshop#put
         * @description create a new workshop
         * @methodOf restSvcs.AdminWorkshop
         */
        'putWorkshop': {method: 'PUT', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.AdminWorkshop#patch
         * @description edit a single workshop
         * @methodOf restSvcs.AdminWorkshop
         * @param {integer} id Workshop-ID
         */
        'edit': {method: 'PATCH', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.AdminWorkshop#delete
         * @description delete a workshop
         * @methodOf restSvcs.AdminWorkshop
         * @param {integer} id Workshop-ID
         */
        'deleteWorkshop': {method: 'DELETE', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.AdminWorkshop#patchwaitinglist
         * @description overbook the workshop
         * @methodOf restSvcs.AdminWorkshop
         * @param {integer} id Workshop-ID
         * @param {integer} participantsid Participants-ID
         */
        'overbook': {method: 'PATCH', url: '/api/admin/workshops/:id/waitinglist/:participantid', params: {id: '@id', participantid: '@participantid'}, isArray: false},
        'participants': {method: 'GET', url: '/api/admin/workshops/:id/participants', params: {id: '@id'}, isArray: true},
        'waitinglist': {method: 'GET', url: '/api/admin/workshops/:id/waitinglist', params: {id: '@id'}, isArray: true},
        'confirmParticipation': {method: 'POST', url: '/api/admin/workshops/:id/participated/:participant', params: {id: '@id', participant: '@participant'}, isArray: true}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.Participants
 * @description Provides CRUD operations for Participant-functions provided by the API
 */
restSvcs.factory('Participants', ['$resource', function ($resource) {
    return $resource('/api/admin/participants/:id', {}, {
        /**
         * @ngdoc function
         * @name restSvcs.Participants#all
         * @description show all participants
         * @methodOf restSvcs.Participants
         * @returns {httpPromise} resolve with fetched data, or fails with error description
         */
        'getall': {method: 'GET', params: {id: 'all'}, isArray: true},
        /**
         * @ngdoc function
         * @name restSvcs.Participants#all
         * @description show all blacklisted participants
         * @methodOf restSvcs.Participants
         * @returns {httpPromise} resolve with fetched data, or fails with error description
         */
        'getblacklistall': {method: 'GET', url: '/api/admin/participants/blacklist/all', isArray: true},
        /**
         * @ngdoc function
         * @name restSvcs.Participants#blacklist
         * @description Put participants on blacklist
         * @methodOf restSvcs.Participants
         */
        'blacklist': {method: 'PUT', url: '/api/admin/participants/:id/blacklist', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Participants#delete
         * @description remove a participant from blacklist
         * @methodOf restSvcs.Participants
         * @param {integer} id Participants-ID
         */
        'removeBlacklist': {url: '/api/admin/participants/:id/blacklist', method: 'DELETE', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc funtion
         * @name restSvcs.Participants#get
         * @description get a single participant
         * @methodOf restSvcs.Participants
         * @param {integer} id Participants-ID
         */
        'getParticipant': {method: 'GET', params: {id: '@id'}, isArray: false},
        'remove': {method: 'DELETE', url: ' /api/admin/participants/:participant/remove/:workshop', params: {participant: '@participant'}, workshop: '@workshop', isArray: false}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.EmailTemplate
 * @description Provides CRUD operations for Emailtemplate-functions provided by the API
 */
restSvcs.factory('EmailTemplate', ['$resource', function ($resource) {
    return $resource('/api/admin/email/template/:id', {}, {
        /**
         * @ngdoc function
         * @name restSvcs.EmailTemplate#all
         * @description show all emailtemplates
         * @methodOf restSvcs.EmailTemplate
         * @returns {httpPromise} resolve with fetched data, or fails with error description
         */
        'getAll': {url: '/api/admin/email/template/list', method: 'GET', isArray: true},
        /**
         * @ngdoc funtion
         * @name restSvcs.EmailTemplate#get
         * @description get a single emailtemplate
         * @methodOf restSvcs.EmailTemplate
         * @param {integer} id Emailtemplate-ID
         */
        'get': {method: 'GET', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.EmailTemplate#patch
         * @description edit a single emailtemplate
         * @methodOf restSvcs.EmailTemplate
         * @param {integer} id Emailtemplate-ID
         */
        'edit': {method: 'PATCH', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.EmailTemplate#put
         * @description create a new Emailtemplate
         * @methodOf restSvcs.EmailTemplate
         */
        'put': {method: 'PUT', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.EmailTemplate#delete
         * @description remove a emailtemplate
         * @methodOf restSvcs.EmailTemplate
         * @param {integer} id Emailtemplate-ID
         */
        'delete': {method: 'DELETE', params: {id: '@id'}, isArray: false}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.Email
 * @description Provides CRUD operations for Email-functions provided by the API
 */
restSvcs.factory('Email', ['$resource', function ($resource) {
    return $resource('/api/admin/email/:id/send', {}, {
        /**
         * @ngdoc function
         * @name restSvcs.Email#send
         * @description send Email
         * @methodOf restSvcs.Email
         * @param {number} workshopid Workshop-ID
         */
        'sendEmail': {method: 'POST', params: {id: '@id'}, isArray: false}
    });
}]);
/**
 * @ngdoc service
 * @name restSvcs.Admin
 * @description Provides operations for Admin-Managment
 */
restSvcs.factory('Admin', ['$resource', function ($resource) {
    return $resource('/api/admin', {}, {
        /**
         * @ngdoc function
         * @name restSvcs.Admin#list
         * @description Returns a list of all currentyl active Admins
         * @methodOf restSvcs.Admin
         */
        'list': {url: '/api/admin/user/list', method: 'GET', isArray: true},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#remove
         * @description Deactivates an admin account
         * @methodOf restSvcs.Admin
         */
        'delete': {url: '/api/admin/user/:id', method: 'DELETE', params: {id: '@id'}, isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#changePassword
         * @description Changes the admin password
         * @methodOf restSvcs.Admin
         */
        'changePassword': {url: '/api/admin/user', method: 'PATCH', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#resetPassword
         * @description Resets the password, if the provided token is valid
         * @methodOf restSvcs.Admin
         */
        'resetPassword': {url: '/api/user/reset/password', method: 'POST', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#requestReset
         * @description Creates a request for a email with password-reset link at the server
         * @methodOf restSvcs.Admin
         */
        'requestReset': {url: ' /api/user/send/password/forgot/email', method: 'POST', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#invite
         * @description Sends an invite link to the passed e-mail
         * @methodOf restSvcs.Admin
         */
        'invite': {url: '/api/admin/user/invite', method: 'POST', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#editContact
         * @description Edits the contact data saved on the server
         * @methodOf restSvcs.Admin
         */
        'editContact': {url: '/api/admin/user/contact/data', method: 'PUT', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#editLegalNotice
         * @description Edits the legal Notice saved on the server
         * @methodOf restSvcs.Admin
         */
        'editLegalNotice': {url: '/api/admin/user/legal/notice', method: 'PUT', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#editContact
         * @description Edits the contact data saved on the server
         * @methodOf restSvcs.Admin
         */
        'getContact': {url: '/api/user/contact/data', method: 'GET', isArray: false},
        /**
         * @ngdoc function
         * @name restSvcs.Admin#editLegalNotice
         * @description Edits the legal Notice saved on the server
         * @methodOf restSvcs.Admin
         */
        'getLegalNotice': {url: '/api/user/legal/notice', method: 'GET', isArray: false},
        'changeEmail': {url: '/api/admin/user/email', method: 'PATCH', isArray: false},
        'createAdmin': {url: '/api/user/create/admin', method: 'POST', isArray: false}
    });
}]);
