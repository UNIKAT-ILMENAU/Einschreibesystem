var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:DashboardCtrl
 * @description Controller for showing administrator functions
 */
mainAppCtrls.controller('DashboardCtrl', ['$scope',
    function ($scope) {

    }

]);

/**
 * Created by Valle on 31.05.2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:AdminCreateCtrl
 * @description Initializes the data & function that are being used to create an admin account
 */
mainAppCtrls.controller('AdminCreateCtrl', ['$scope', '$stateParams', '$alert', '$translate', 'Admin', '$state',
    function ($scope, $stateParams, $alert, $translate, Admin, $state) {

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['PASSWORDS_IDENTICAL_ERROR', 'EMAIL', 'USERNAME', 'NEW_PASSWORD', 'REPEAT_PASSWORD',
            'ALERT_CREATE_ADMIN_FAIL', 'ALERT_CREATE_ADMIN_SUCCESS', 'TITLE_SUCCESS', 'TITLE_ERROR'])
            .then(function (translations) {
                _translations = translations;
                $scope.placeholder = {
                    username: _translations.USERNAME,
                    password: _translations.NEW_PASSWORD,
                    confirm_password: _translations.REPEAT_PASSWORD,
                    email: _translations.EMAIL
                };
                $scope.form = {};
                $scope.myAlert = $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.PASSWORDS_IDENTICAL_ERROR,
                    container: '#alert',
                    show: false,
                    dismissable: false
                });
            });

        $scope.form = {};
        $scope.myAlert = $alert({

            title: _translations.TITLE_ERROR,
            type: 'danger',
            content: _translations.PASSWORDS_IDENTICAL_ERROR,
            container: '#alert',
            show: false,
            dismissable: false
        });
        var token = $stateParams.token;

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdminCreateCtrl#sendInfo
         * @methodOf mainAppCtrls.controller:AdminCreateCtrl
         * @description Sends a request to create an admin account to the server and handles the response
         */
        $scope.sendInfo = function () {
            var match = ($scope.form.password_confirm == $scope.form.password);
            if (!match) {

                $scope.form.password_confirm = "";
                $scope.myAlert.show();
            }
            else {
                $scope.myAlert.hide();
                var _data = {
                    email: $scope.form.email,
                    password: $scope.form.password,
                    code: token,
                    username: $scope.form.username
                };
                Admin.createAdmin(_data).$promise.then(function (response) {
                    $state.go('login');
                }, function (response) {
                    var _msg = "";
                    switch (httpResponse.status) {
                        case 400:
                            _msg = _translations.ALERT_NO_CONTENT;
                        case 401:
                            _msg = _translations.ALERT_FALSE_TOKEN;
                            break;
                        case 403:
                            _msg = _translations.ALTERT_CREATE_ADMIN_FAIL;
                    }

                    $alert({
                        title: _translations.TITLE_ERROR,
                        type: 'danger',
                        content: _msg,
                        container: '#alert',
                        dismissable: true,
                        show: true,
                        duration: 15
                    });
                });

            }
        };
    }
]);

/**
 * Created by Ahmet on 04.06.2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:EmailTemplateCtrl
 * @description Module containing all email templates
 * @requires restSvscs.EmailTemplate
 */
mainAppCtrls.controller('EmailTemplateCtrl', ['$scope', "EmailTemplate", '$alert', '$modal', '$translate',

    function ($scope, EmailTemplate, $alert, $modal, $translate) {

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_EMAILTEMPLATE_DELETE_SUCCESS', 'ALERT_EMAILTEMPLATE_DELETE_FAIL', 'TITLE_ERROR', 'TITLE_SUCCESS'
        ]).then(function (translations) {
            _translations = translations;
        });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EmailTemplateCtrl#loadTemplates
         * @methodOf mainAppCtrls.controller:EmailTemplateCtrl
         * @description Function loads the actual list of all email templates
         */
        var loadTemplates = function () {
            $scope.loading = true;
            EmailTemplate.getAll()
                .$promise.then(function (value) {
                    $scope.data = value;
                    $scope.loading = false;

                }, function (httpResponse) {
                    $scope.loading = false;
                });
        };
        loadTemplates();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EmailTemplateCtrl#delete
         * @methodOf mainAppCtrls.controller:EmailTemplateCtrl
         * @description Function removes a single email template from the list
         * @params {number} _id email template id, which should be removed
         */
        $scope.delete = function (_id) {
            EmailTemplate.delete({id: _id}).$promise.then(function (httpResponse) {
                    $alert({
                        title: _translations.TITLE_SUCCESS,
                        type: 'success',
                        container: '#alert',
                        show: true,
                        dismissable: false,
                        content: _translations.ALERT_EMAILTEMPLATE_DELETE_SUCCESS,
                        duration: 20
                    });
                    loadTemplates();
                }
                , function (httpResponse) {
                    $alert({
                        title: _translations.TITLE_ERROR,
                        type: 'danger',
                        content: _translations.ALERT_EMAILTEMPLATE_DELETE_FAIL + ' (' + httpResponse.status + ')',
                        container: '#alert',
                        dismissable: false,
                        show: true,
                        duration: 20
                    });
                }
            )

        }

    }

]);

/**
 * Created by hunte on 12/06/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @requires restSvcs.AdminWorkshop
 * @requires restSvcs.Workshops
 * @description Controller for editing a workshop. Initializes resources used to edit a workshop
 * @name mainAppCtrls.controller:AdminEditWorkshopCtrl
 */
mainAppCtrls.controller('AdminEditWorkshopCtrl', ['$scope', 'Workshops', 'AdminWorkshop', '$stateParams', '$translate', '$alert', '$state',
    function ($scope, Workshops, AdminWorkshop, $stateParams, $translate, $alert, $state) {

        var _workshopId = $stateParams.id;

        //Initialize _originalData
        var _originalData = {};
        $scope.workshop = {};
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOP_EDIT_SUCCESS', 'TITLE_SUCCESS', 'TITLE_ERROR',
            'ALERT_WORKSHOP_EDIT_FAIL', 'ALERT_WORKSHOP_NOT_FOUND', 'ALERT_WORKSHOP_IN_PAST', 'ALERT_NEGATIVE_COST', 'ALERT_NEGATIVE_PARTICIPANTS']).
            then(function (translations) {
                _translations = translations;
            });
        var reformatDate = function (_date) {
            if (!_date || _date == null)
                return "";
            var _dateStr = _date.toJSON();
            if (_dateStr == null)
                return "";
            _dateStr = _dateStr.slice(0, _dateStr.length - 5);
            return _dateStr.replace('T', ' ');
        };
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdminEditWorkshopCtrl#discardChanges
         * @description Discards changes and restores the original data
         * @methodOf mainAppCtrls.controller:AdminEditWorkshopCtrl
         */
        $scope.discardChanges = function () {
            $scope.workshop.title = _originalData.title;
            $scope.workshop.description = _originalData.description;
            $scope.workshop.cost = _originalData.cost;
            $scope.workshop.requirement = _originalData.requirement;
            $scope.workshop.location = _originalData.location;
            $scope.workshop.start_at = _originalData.start_at;
            $scope.workshop.end_at = _originalData.end_at;
            $scope.workshop.duration = _originalData.duration;
            $scope.workshop.max_participants = _originalData.max_participants;

        };

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdminEditWorkshopCtrl#confirmChanges
         * @description Sends changes to the API and stores them as new original data
         * @methodOf mainAppCtrls.controller:AdminEditWorkshopCtrl
         */
        $scope.confirmChanges = function () {

            var reformatDate = function (_date) {
                if (_date == null)
                    return "";
                var str = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " ";
                if (_date.getHours() < 10)
                    str += "0";
                str += _date.getHours() + ":";
                if (_date.getMinutes() < 10)
                    str += "0";
                str += _date.getMinutes() + ":";
                if (_date.getSeconds() < 10)
                    str += "0";
                str += _date.getSeconds();
                return str;
            };
            var _sa = Date.parse($scope.workshop.start_at);
            var _duration = $scope.workshop.duration;
            var _ea = new Date(_sa + _duration + 1000 * 60 * 60);

            var error = false;
            if ($scope.workshop.cost < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_COST,
                    container: '#alert',
                    dismissable: false,
                    show: true,
                    duration: 30
                });
                error = true;
            }

            if ($scope.workshop.max_participants < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_PARTICIPANTS,
                    container: '#alert',
                    dismissable: false,
                    show: true,
                    duration: 30
                });
                error = true;
            }
            var now = new Date();
            if ($scope.workshop.start_at < now) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_IN_PAST,
                    container: '#alert',
                    dismissable: false,
                    show: true,
                    duration: 30
                });
                error = true;
            }

            if (error)
                return false;

            var _dataToSend = {
                title: $scope.workshop.title,
                description: $scope.workshop.description,
                cost: $scope.workshop.cost,
                requirements: $scope.workshop.requirement,
                location: $scope.workshop.location,
                start_at: reformatDate((new Date(_sa))),
                end_at: reformatDate(_ea),
                max_participants: $scope.workshop.max_participants
            };
            AdminWorkshop.edit({id: _workshopId}, _dataToSend).$promise.then(function (value) {
                //Store answer from server
                _originalData = {
                    title: value.title,
                    description: value.title,
                    cost: value.title,
                    requirement: value.title,
                    location: value.title,
                    start_at: value.title,
                    end_at: value.end_at,
                    max_participants: value.max_participants

                };
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_WORKSHOP_EDIT_SUCCESS + ' \"' + _originalData.title + '\"',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 30
                });
                //Redirect to Details page
                $state.go("administrator_workshop_details", {id: value.id});
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_EDIT_FAIL + '(' + httpResponse.status + ')',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 60
                });
            });
        };

        //Fetch data from API
        $scope.loading = true;
        Workshops.get({id: _workshopId}).$promise.then(function (value) {

            //Store original data in case of discard
            _originalData = {
                title: value.title,
                description: value.description,
                cost: value.cost,
                requirement: value.requirement,
                location: value.location,
                start_at: value.start_at,
                end_at: value.end_at,
                max_participants: value.max_participants
            };
            var _ea = Date.parse(_originalData.end_at);
            var _sa = Date.parse(_originalData.start_at);
            _originalData.duration = _ea - _sa;

            //Store original data in ng-model
            $scope.workshop.title = _originalData.title;
            $scope.workshop.description = _originalData.description;
            $scope.workshop.cost = _originalData.cost;
            $scope.workshop.requirement = _originalData.requirement;
            $scope.workshop.location = _originalData.location;
            $scope.workshop.start_at = _originalData.start_at;
            $scope.workshop.end_at = _originalData.end_at;
            $scope.workshop.duration = _originalData.duration;
            $scope.workshop.max_participants = _originalData.max_participants;

            $scope.loading = false;
        }, function (httpResponse) {
            if (httpResponse.status === 404)
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_NOT_FOUND,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });

            $scope.loading = false;
        });
    }
]);
/**
 * Created by mohammad on 27/06/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:adminEmailConfirmCtrl
 * @description Controller to create a new email template to send a confirmation to the marked participants
 * @requires restSvcs.EmailTemplate
 */
mainAppCtrls.controller('adminEmailConfirmCtrl', ['$scope', "EmailTemplate", '$translate', '$alert', '$stateParams', 'Email',
    function ($scope, EmailTemplate, $translate, $alert, $stateParams, Email) {
        $scope.email = {};
        $scope.workshopid = $stateParams.id;
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['TITLE_SUCCESS', 'TITLE_ERROR', 'ALERT_EMAILCONFIRM_SEND_SUCCESS',
            'ALERT_EMAILCONFIRM_SEND_FAIL']).
            then(function (translations) {
                _translations = translations;
            });
        //load available Workshoptemplates for list
        EmailTemplate.getAll().$promise.then(function (response) {
            $scope.templates = response;
        }, function (response) {

        });
        $scope.loadTemplate = function () {
            var template = JSON.parse(JSON.stringify($scope.selectedTemplate));
            $scope.email.body = template.email_body;
            $scope.email.subject = template.email_subject;
        };

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminEmailConfirmCtrl#sendInfo
         * @description Sends the data of the created email template to the server
         * @methodOf mainAppCtrls.controller:adminEmailConfirmCtrl
         */
        $scope.send = function () {
            var _data = {
                content: $scope.email.body,
                subject: $scope.email.subject
            };
            Email.sendEmail({id: $scope.workshopid}, _data).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    content: _translations.ALERT_EMAILCONFIRM_SEND_SUCCESS,
                    title: _translations.TITLE_SUCCESS,
                    dissmisable: false,
                    show: true,
                    duration: 20
                });
            }, function (response) {
                $alert({
                    type: 'danger',
                    content: _translations.ALERT_EMAILCONFIRM_SEND_FAIL + response.status,
                    title: _translations.TITLE_ERROR,
                    dissmisable: false,
                    show: true,
                    duration: 20
                });
            });

        }
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminEmailConfirmCtrl#discard
         * @description Discards all data of the document
         * @methodOf mainAppCtrls.controller:adminEmailConfirmCtrl
         */

        $scope.discard = function () {
            $scope.email.subject = "";
            $scope.email.body = "";

        }

    }

]);

/**
 * Created by hunte on 12/06/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:AdminNewWorkshopCtrl
 * @description Controller initializing the creation of a new workshop
 * @requires restSvcs.Workshops
 * @requires restSvcs.AdminWorkshop
 */
mainAppCtrls.controller('AdminNewWorkshopCtrl', ['$scope', "Workshops", "AdminWorkshop", 'WorkshopTemplate', '$translate', '$alert', '$state',
    function ($scope, Workshops, AdminWorkshop, WorkshopTemplate, $translate, $alert, $state) {
        $scope.workshop = {};

        //load available Workshoptemplates for list
        WorkshopTemplate.getAll().$promise.then(function (response) {
            $scope.templates = response;
        }, function (response) {

        });
        $scope.loadTemplate = function () {
            $scope.workshop = JSON.parse(JSON.stringify($scope.selectedTemplate));
            var _ea = Date.parse($scope.workshop.end_at);
            var _sa = Date.parse($scope.workshop.start_at);
            $scope.workshop.duration = new Date(_ea - _sa);
            $scope.workshop.start_at = new Date().setHours(0,0,0,0);
        };
        $scope.workshop.duration = new Date(0);
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOP_NEW_SUCCESS', 'TITLE_SUCCESS', 'TITLE_ERROR',
            'ALERT_WORKSHOP_NEW_FAIL', 'ALERT_NEGATIVE_COST', 'ALERT_NEGATIVE_PARTICIPANTS', 'ALERT_WORKSHOP_IN_PAST']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdminNewWorkshopCtrl#sendInfo
         * @description Sends the data of the created workshop to the server
         * @methodOf mainAppCtrls.controller:AdminNewWorkshopCtrl
         */
        $scope.sendInfo = function () {
            //Adjusts the format of the date strings to fit the requirements of the API
            var reformatDate = function (_date) {
                if (_date == null)
                    return "";
                var str = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " ";
                if (_date.getHours() < 10)
                    str += "0";
                str += _date.getHours() + ":";
                if (_date.getMinutes() < 10)
                    str += "0";
                str += _date.getMinutes() + ":";
                if (_date.getSeconds() < 10)
                    str += "0";
                str += _date.getSeconds();
                return str;
            };

            var _sa = new Date($scope.workshop.start_at);
            // var _duration = new Date($scope.workshop.duration);
            var _duration = $scope.workshop.duration;
            _duration = Date.UTC(_duration.getFullYear(), _duration.getMonth(), _duration.getDate(), _duration.getHours(), _duration.getMinutes());
            var _ea = _sa;
            _ea.setMilliseconds(_sa.getMilliseconds() + _duration);
            var now = new Date();
            var error = false;
            if ($scope.workshop.cost < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_COST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if ($scope.workshop.max_participants < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_PARTICIPANTS,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if ($scope.workshop.start_at < now) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_IN_PAST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if (error)
                return false;

            var data = {
                title: $scope.workshop.title,
                description: $scope.workshop.description,
                cost: $scope.workshop.cost,
                requirements: $scope.workshop.requirement,
                location: $scope.workshop.location,
                start_at: reformatDate($scope.workshop.start_at),
                end_at: reformatDate(_ea),
                max_participants: $scope.workshop.max_participants
            };
            AdminWorkshop.putWorkshop(data).$promise.then(function (httpResponse) {
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_WORKSHOP_NEW_SUCCESS + ' \"' + data.title + '\"',
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                $state.go("administrator_workshop_details", {id: httpResponse.id});
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_NEW_FAIL + ' (' + httpResponse.status + ')',
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
            });
        };
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdminNewWorkshopCtrl#discard
         * @description Discards the data of the created workshop
         * @methodOf mainAppCtrls.controller:AdminNewWorkshopCtrl
         */
        $scope.discard = function () {

            $scope.workshop.title = "";
            $scope.workshop.description = "";
            $scope.workshop.cost = "";
            $scope.workshop.requirement = "";
            $scope.workshop.location = "";
            $scope.workshop.sharedDate = "";
            $scope.workshop.start_at = "";
            $scope.workshop.duration = "";
            $scope.workshop.max_participants = "";
            if ($scope.selectedTemplate != null) {
                $scope.workshop = JSON.parse(JSON.stringify($scope.selectedTemplate));
            }

        }

    }

]);
/**
 * Created by Ahmet on 08.06.2016.
 */

var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:adminWorkshopDetailsCtrl
 * @requires restSvcs.Workshops
 * @description Controller for showing administrator functions in a workshop.
 */
mainAppCtrls.controller('adminWorkshopDetailsCtrl', ['$scope', 'Workshops', 'Participants', '$stateParams', "$alert", 'printer', '$translate', 'AdminWorkshop',
    function ($scope, Workshops, Participants, $stateParams, $alert, printer, $translate, AdminWorkshop) {
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['TITLE_SUCCESS', 'TITLE_ERROR', 'TITLE_INFO', 'ALERT_NO_PARTICIPANTS', 'ALERT_SUCCESSFUL_OVERBOOK', 'ALERT_FAIL_OVERBOOK', 'ALERT_SUCCESSFUL_BLACKLISTED',
            'ALERT_SUCCESSFUL_REMOVED_USER', 'ALERT_FAILED_REMOVED_USER', 'PARTICIPATION_CONFIRM_SUCCESS', 'PARTICIPATION_CONFIRM_ERROR']).
            then(function (translations) {
                _translations = translations;
            });

        $scope.workshopid = $stateParams.id;
        $scope.loading = true;
        Workshops.get({id: $scope.workshopid}).$promise.then(function (value, httpResponse) {
            $scope.workshop = value;

            var _ea = Date.parse($scope.workshop.end_at);
            var _sa = Date.parse($scope.workshop.start_at);
            var _durationInMs = _ea - _sa;
            // calculate duration in hh:mm
            var _duration = ("0" + Math.floor(_durationInMs/(1000*60*60))).slice(-2) + ":" +
                ("0" + Math.floor((_durationInMs%(1000*60*60))/(1000 * 60))).slice(-2);
            $scope.workshop.duration = _duration;
            $scope.loading = false;
        }, function (httpResponse) {
            $alert({
                title: _translations.TITLE_ERROR,
                type: 'danger',
                content: httpResponse.status,
                container: '#alert',
                dismissable: false,
                show: true
            });
            $scope.loading = false;
        });
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopDetailsCtrl#loadParticipants
         * @methodOf mainAppCtrls.controller:adminWorkshopDetailsCtrl
         * @description Function to load a list of remaining Participants
         */
        var loadParticipants = function () {
            $scope.loading = true;
            AdminWorkshop.participants({id: $scope.workshopid}).$promise.then(function (value, httpResponse) {
                $scope.participants = value;

                $scope.loading = false;
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 404:
                        $alert({
                            title: _translations.TITLE_INFO,
                            type: 'info',
                            content: _translations.ALERT_NO_PARTICIPANTS,
                            container: '#alertParticipant',
                            dismissable: false,
                            show: true,
                            animation: 'am-fade-and-slide-top'
                        });
                }
                $scope.loading = false;
            });

        };
        var loadWaitinglist = function () {
            $scope.loading = true;
            AdminWorkshop.waitinglist({id: $scope.workshopid}).$promise.then(function (response) {
                $scope.waitingList = response;
                $scope.loading = false;
            }, function (response) {
                $scope.loading = false;
            });
        };

        //Load participants
        loadParticipants();

        //Load waitinglist
        loadWaitinglist();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopDetailsCtrl#printList
         * @methodOf mainAppCtrls.controller:adminWorkshopDetailsCtrl
         * @description Prints the participants list
         */
        $scope.printList = function () {
            printer.print('resources/views/participantList.tpl.html', $scope.participants, $scope.workshop);
        };

        //Overbook a participant from the waitinglist
        $scope.overbook = function (_id) {
            AdminWorkshop.overbook({id: $scope.workshopid, participantid: _id}).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_SUCCESSFUL_OVERBOOK,
                    show: 'true',
                    title: _translations.TITLE_SUCCESS
                });
                loadParticipants();
                loadWaitinglist();
            }, function (response) {
                $alert({
                    type: 'danger',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_FAIL_OVERBOOK,
                    show: 'true',
                    title: _translations.TITLE_ERROR
                });
            });
        };

        //Move participant to blacklist
        $scope.blacklistUser = function (_id) {
            Participants.blacklist({id: _id}).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_SUCCESSFUL_BLACKLISTED,
                    show: true,
                    title: _translations.TITLE_SUCCESS
                });
                loadParticipants();
                loadWaitinglist();
            }, function (response) {
                $alert({
                    type: 'danger',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_FAILED_BLACKLISTED + '(' + response.status + ')',
                    show: true,
                    title: _translations.TITLE_ERROR
                });
            });
        };

        //Remove participant from list
        $scope.remove = function (_participant, _workshop) {
            Participants.remove({participant: _participant, workshop: _workshop}).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_SUCCESSFUL_REMOVED_USER,
                    show: true,
                    title: _translations.TITLE_SUCCESS
                });
                loadParticipants();
                loadWaitinglist();
            }, function (response) {
                $alert({
                    type: 'danger',
                    duration: 20,
                    container: '#alert',
                    content: _translations.ALERT_FAILED_REMOVED_USER + '(' + response.status + ')',
                    show: true,
                    title: _translations.TITLE_ERROR
                });
            });
        };

        //Confirm participantion
        $scope.confirmUser = function (_workshop, _user) {

            AdminWorkshop.confirmParticipation({id: _workshop, participant: _user}).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    duration: 20,
                    container: '#alert',
                    content: _translations.PARTICIPATION_CONFIRM_SUCCESS,
                    show: true,
                    title: _translations.TITLE_SUCCESS
                });
            }, function (response) {
                $alert({
                    type: 'danger',
                    duration: 20,
                    container: '#alert',
                    content: _translations.PARTICIPATION_CONFIRM_ERROR + response.statusText,
                    show: true,
                    title: _translations.TITLE_ERROR
                });
            });
        }

    }
]);
/**
 * Created by Ahmet on 08.06.2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:adminWorkshopManagementCtrl
 * @description Shows a list of past and future workshops
 * @requires restSvcs.AdminWorkshop
 */
mainAppCtrls.controller('adminWorkshopManagementCtrl', ['$scope', 'AdminWorkshop', '$alert', '$translate',
    function ($scope, AdminWorkshop, $alert, $translate) {

        //Define object to store the alert in
        $scope.myAlert;
        $scope.currentList = [];
        $scope.elapsedList = [];

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOP_DELETE_SUCCESS',
            'ALERT_INTERNAL_SERVER_ERROR', 'ALERT_WORKSHOP_DELETE_FAIL']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopManagementCtrl#compareToCurrent
         * @params {Date} a Date to compare to current Date
         * @methodOf mainAppCtrls.controller:adminWorkshopManagementCtrl
         * @description Compares the give date to the current date
         * @returns {boolean} Returns true if passed date lies in the future
         **/
        var compareToCurrent = function (a) {
            var d1 = new Date();
            var d2 = new Date(a);
            return (d2.getTime() > d1.getTime())
        };
        //Get and store translation for alert title.
        $translate(['TITLE_ERROR', 'ERROR_NO_WORKSHOPS', 'EMPTY_WORKSHOP', 'TITLE_SUCCESS']).then(function (translations) {
            $scope.errorTitle = translations.TITLE_ERROR;
            $scope.errorMsg = translations.ERROR_NO_WORKSHOPS;
            $scope.successTitle = translations.TITLE_SUCCESS;
            $scope.emptyMsg = translations.EMPTY_WORKSHOP;
        });
        var loadWorkshops = function () {
            $scope.loading = true;
            AdminWorkshop.gethistory().$promise.then(function (value) {
                var workshopList = value;
                $scope.currentList = [];
                $scope.elapsedList = [];
                $scope.loading = false;
                for (var i = 0; i < workshopList.length; i++) {
                    if (compareToCurrent(workshopList[i].start_at))
                        $scope.currentList.push(workshopList[i]);
                    else
                        $scope.elapsedList.push(workshopList[i]);
                }
            }, function (httpResponse) {
                //switch through all possible errors
                switch (httpResponse.status) {
                    case 204:
                        $scope.myAlert = $alert({
                            title: $scope.errorTitle,
                            type: 'danger',
                            content: $scope.emptyMsg,
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                    //Alert for error 404, no workshops available
                    case 404:
                        $scope.myAlert = $alert({

                            title: $scope.errorTitle,
                            type: 'danger',
                            content: $scope.errorMsg,
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                    case 500:
                        $scope.myAlert = $alert({
                            title: $scope.errorTitle,
                            type: 'danger',
                            content: _translations.ALERT_INTERNAL_SERVER_ERROR + ' (' + httpResponse.status + ')',
                            container: '#alert',
                            dismissable: false,
                            show: true
                        });
                        break;
                }
                $scope.loading = false;
            });
        };
        loadWorkshops();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:adminWorkshopManagementCtrl#delete
         * @methodOf mainAppCtrls.controller:adminWorkshopManagementCtrl
         * @description Function removes a single Workshop from the list
         * @params {number} _id workshop id, which should be removed
         */
        $scope.delete = function (_id) {
            AdminWorkshop.delete({id: _id}).$promise.then(function (httpResponse) {
                    $alert({
                        title: $scope.successTitle,
                        type: 'success',
                        container: '#alert',
                        show: true,
                        dismissable: true,
                        content: _translations.ALERT_WORKSHOP_DELETE_SUCCESS,
                        duration: 20
                    });
                    loadWorkshops();
                }
                , function (httpResponse) {
                    $alert({
                        title: $scope.errorTitle,
                        type: 'danger',
                        container: '#alert',
                        show: true,
                        dismissable: true,
                        content: _translations.ALERT_WORKSHOP_DELETE_FAIL + ' (' + httpResponse.status + ')',
                        duration: 20
                    });
                }
            )

        }

    }
]);
/**
 * Created by hunte on 31/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:AdministratorManagementCtrl
 * @descirption Controller for managing administrator list
 * @requires restSvcs.Admin
 */
mainAppCtrls.controller('AdministratorManagementCtrl', ['$scope', 'Admin', '$alert', '$translate',
    function ($scope, Admin, $alert, $translate) {
        $scope.loading = true;

        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['INVITED_ADMINISTRATOR_EMAIL', 'TITLE_ERROR', 'TITLE_SUCCESS', 'INVITED_ADMINISTRATOR_EMAIL_ERROR', 'ALERT_DELETE_ADMIN_FAILED',
            'ALERT_DELETE_ADMIN_SUCCESS', ]).then(function (translations) {
            _translations = translations;
        });
        var loadList = function () {
            $scope.loading = true;
            Admin.list().$promise.then(function (value) {
                $scope.admins = value;
                $scope.loading = false;
            }, function (httpResponse) {
                alert(httpResponse.status);
                $scope.loading = false;
            });
        };
        loadList();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdministratorManagementCtrl#delete
         * @description Deletes the admin who has the selected id
         * @param {number} _id ID of the admin to delete
         * @methodOf mainAppCtrls.controller:AdministratorManagementCtrl
         */
        $scope.deleteAdmin = function (_id) {
            $scope.loading = true;
            Admin.delete({id: _id}).$promise.then(function (value) {
                loadList();
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_DELETE_ADMIN_SUCCESS,
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 10
                });
            }, function (httpResponse) {
                $scope.loading = false;
                $alert({
                    type: _translations.TITLE_ERROR,
                    title: 'Error',
                    content: _translations.ALERT_DELETE_ADMIN_FAILED,
                    container: '#alert',
                    show: true,
                    dismissable: false,
                    duration: 30
                });
            });
        }
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:AdministratorManagementCtrl#delete
         * @description invites a new admin
         * @methodOf mainAppCtrls.controller:AdministratorManagementCtrl
         */
        $scope.invite = function () {
            Admin.invite({email: $scope.admin_mail}).$promise.then(function (value) {
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.INVITED_ADMINISTRATOR_EMAIL,
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 30
                });
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.INVITED_ADMINISTRATOR_EMAIL_ERROR,
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 60
                })
            });
        }
    }
]);
var mainAppCtrls = angular.module("mainAppCtrls");

/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:BlacklistCtrl
 * @description Controller show you a list of blacklisted users
 * @requires restSvcs.Participants
 */
mainAppCtrls.controller('BlacklistCtrl', ['$scope', "Participants", '$alert', '$modal', '$translate',

    function ($scope, Participants, $alert, $modal, $translate) {


        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_BLACKLIST_DELETE_PARTICIPANT',
            'ALERT_BLACKLIST_DELETE_PARTICIPANT_FAIL', 'TITLE_SUCCESS', 'TITLE_ERROR']).
            then(function (translations) {
                _translations = translations;
            });
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:BlacklistCtrl#loadingBlacklist
         * @methodOf mainAppCtrls.controller:BlacklistCtrl
         * @description Function to load a list of persons, which were set on the blacklist
         */
        var loadBlacklist = function () {
            $scope.loading = true;
            Participants.getblacklistall()
                .$promise.then(function (value) {
                    $scope.userdata = value;
                    $scope.loading = false;

                }, function (httpResponse) {
                    $scope.loading = false;
                });
        };
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:BlacklistCtrl#delete
         * @methodOf mainAppCtrls.controller:BlacklistCtrl
         * @description Function removes a selected person from the blacklist
         * @params {number} _id user id of the person, which should be removed
         */
        $scope.delete = function (_id) {
            $scope.deleting = true;
            Participants.removeBlacklist({id: _id}).$promise.then(function (httpResponse) {
                    $scope.deleting = false;
                    $alert({
                        title: _translations.TITLE_SUCCESS,
                        type: 'success',
                        container: '#alert',
                        show: true,
                        dismissable: false,
                        content: _translations.ALERT_BLACKLIST_DELETE_PARTICIPANT,
                        duration: 20
                    });
                    loadBlacklist();
                }
                , function (httpResponse) {
                    $scope.deleting = false;
                    $alert({
                        title: _translations.TITLE_ERROR,
                        type: 'danger',
                        content: _translations.ALERT_BLACKLIST_DELETE_PARTICIPANT_FAIL + ' (' + httpResponse.status + ')',
                        container: '#alert',
                        dismissable: false,
                        show: true
                    });
                }
            )

        }
        loadBlacklist();

    }


]);
/**
 * Created by hunte on 31/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:ContactCtrl
 * @description Controller for showing contacts
 */
mainAppCtrls.controller('ContactCtrl', ['$scope', 'Admin',
    function ($scope, Admin) {
        $scope.contact = {};
        Admin.getContact().$promise.then(function (response) {
            if (response.status != 204)
                $scope.contact = response.content;
        }, function (response) {

        });
    }

]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @requires restSvcs.EmailTemplate
 * @description Controller for editing a workshop template. Provide
 * @name mainAppCtrls.controller:EditEmailTemplateCtrl
 * @requires restSvcs.EmailTemplate
 */
mainAppCtrls.controller('EditEmailTemplateCtrl', ['$scope', 'EmailTemplate', '$stateParams', '$translate', '$alert', '$state',
    function ($scope, EmailTemplate, $stateParams, $translate, $alert, $state) {

        var _workshopId = $stateParams.id;

        //Initialize _originalData
        var _originalData = {};

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_EMAILTEMPLATE_EDIT_SUCCESS', 'TITLE_SUCCESS', 'TITLE_ERROR',
            'ALERT_EMAILTEMPLATE_EDIT_FAIL', 'ALERT_EMAILTEMPLATE_NOT_FOUND']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EditEmailTemplateCtrl#discardChanges
         * @description Discards changes and restores the original data
         * @methodOf mainAppCtrls.controller:EditEmailTemplateCtrl
         */
        $scope.discardChanges = function () {
            $scope.title = _originalData.title;
            $scope.email = _originalData.email;
        }

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EditEmailTemplateCtrl#confirmChanges
         * @description Sends changes to the API and stores them as new original data
         * @methodOf mainAppCtrls.controller:EditEmailTemplateCtrl
         */
        $scope.confirmChanges = function () {
            var _dataToSend = {
                template_name: '',
                email_subject: '',
                email_body: ''
            };
            var _changedData = {
                title: $scope.title,
                email: $scope.email
            };

            //compare all properties of both objects
            if (_changedData.title != _originalData.title)
                _dataToSend.template_name = _changedData.title;
            if (_changedData.email.body != _originalData.email.body)
                _dataToSend.email_body = _changedData.email.body;
            if (_changedData.email.subject != _originalData.email.subject)
                _dataToSend.email_subject = _changedData.email.subject;

            EmailTemplate.edit({id: _workshopId}, _dataToSend).$promise.then(function (value) {
                //Store answer from server
                _originalData = {
                    title: value.template_name,
                    email: {
                        subject: value.email_subject,
                        body: value.email_body
                    }
                };
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_EMAILTEMPLATE_EDIT_SUCCESS + ' \"' + _originalData.title + '\"',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 30
                });
                $state.go("email_template")
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_EMAILTEMPLATE_EDIT_FAIL + '(' + httpResponse.status + ')',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 60
                });
            });
        }

        //Fetch data from API
        $scope.loading = true;
        EmailTemplate.get({id: _workshopId}).$promise.then(function (value) {

            //Store original data in case of discard
            _originalData = {
                title: value.template_name,
                email: {
                    subject: value.email_subject,
                    body: value.email_body
                }
            };
            //Store original data in ng-model
            $scope.title = _originalData.title;
            //IMPORTANT DEEP COPY ARRAYS, SO NO REFERENCE IS CREATED
            $scope.email = {
                body: _originalData.email.body,
                subject: _originalData.email.subject
            };
            $scope.loading = false;
        }, function (httpResponse) {
            if (httpResponse.status === 404)
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_EMAILTEMPLATE_NOT_FOUND,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });

            $scope.loading = false;
        });
    }
]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @requires restSvcs.WorkshopTemplate
 * @description Controller for editing a workshop template.
 * @name mainAppCtrls.controller:EditWorkshopTemplateCtrl
 * @requires restSvcs.WorkshopTemplate
 */
mainAppCtrls.controller('EditWorkshopTemplateCtrl', ['$scope', 'WorkshopTemplate', '$stateParams', '$translate', '$alert', '$state',
    function ($scope, WorkshopTemplate, $stateParams, $translate, $alert, $state) {

        var _workshopId = $stateParams.id;
        $scope.workshop = {};
        //Initialize _originalData
        var _originalData = {};

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOPTEMPLATE_EDIT_SUCCESS',
            'ALERT_WORKSHOPTEMPLATE_EDIT_FAIL', 'ALERT_WORKSHOPTEMPLATE_NOT_FOUND', 'TITLE_SUCCESS', 'TITLE_ERROR']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EditWorkshopTemplateCtrl#discard
         * @description Discards changes and restores the original data
         * @methodOf mainAppCtrls.controller:EditWorkshopTemplateCtrl
         */
        $scope.discard = function () {

            $scope.workshop.title = _originalData.title;
            $scope.workshop.description = _originalData.description;
            $scope.workshop.cost = _originalData.cost;
            $scope.workshop.requirements = _originalData.requirements;
            $scope.workshop.location = _originalData.location;
            $scope.workshop.start_at = _originalData.start_at;
            $scope.workshop.end_at = _originalData.end_at;
            $scope.workshop.max_participants = _originalData.max_participants;
        };

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:EditWorkshopTemplateCtrl#sendInfo
         * @description Sends changes to the API and stores them as new original data
         * @methodOf mainAppCtrls.controller:EditWorkshopTemplateCtrl
         */
        $scope.sendInfo = function () {
            var reformatDate = function (_date) {
                if (_date == null)
                    return "";
                var str = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " ";
                if (_date.getHours() < 10)
                    str += "0";
                str += _date.getHours() + ":";
                if (_date.getMinutes() < 10)
                    str += "0";
                str += _date.getMinutes() + ":";
                if (_date.getSeconds() < 10)
                    str += "0";
                str += _date.getSeconds();
                return str;
            };
            var _sa = Date.parse($scope.workshop.start_at);
            var _duration = $scope.workshop.duration;
            var _ea = new Date(_sa + _duration);

            var error = false;
            if ($scope.workshop.cost < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_COST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if ($scope.workshop.max_participants < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_PARTICIPANTS,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }
            var now = new Date();
            if ($scope.workshop.start_at < now) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_IN_PAST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if (error)
                return false;

            var data = {
                title: $scope.workshop.title,
                description: $scope.workshop.description,
                cost: $scope.workshop.cost,
                requirement: $scope.workshop.requirement,
                location: $scope.workshop.location,
                start_at: reformatDate((new Date(_sa))),
                end_at: reformatDate(_ea),
                max_participants: $scope.workshop.max_participants
            };
            WorkshopTemplate.edit({id: _workshopId}, data).$promise.then(function (value) {
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_WORKSHOPTEMPLATE_EDIT_SUCCESS + ' \"' + _originalData.title + '\"',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 30
                });
                $state.go("workshop_template");
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOPTEMPLATE_EDIT_FAIL + '(' + httpResponse.status + ')',
                    container: '#alert',
                    dismissable: true,
                    show: true,
                    duration: 60
                });
            });
        };

        //Fetch data from API
        $scope.loading = true;
        WorkshopTemplate.get({id: _workshopId}).$promise.then(function (value) {

            //calculate duration
            var _ea = Date.parse(value.end_at);
            var _sa = Date.parse(value.start_at);
            var _duration = _ea - _sa;
            //Store original data in case of discard
            _originalData = {
                title: value.title,
                description: value.description,
                cost: value.cost,
                requirement: value.requirement,
                location: value.location,
                duration: _duration,
                start_at: value.start_at,
                end_at: value.end_at,
                max_participants: value.max_participants

            };

            //Store original data in ng-model
            $scope.workshop.title = _originalData.title;
            $scope.workshop.description = _originalData.description;
            $scope.workshop.cost = _originalData.cost;
            $scope.workshop.requirement = _originalData.requirement;
            $scope.workshop.location = _originalData.location;
            $scope.workshop.duration = _originalData.duration;
            $scope.workshop.start_at = _originalData.start_at;
            $scope.workshop.end_at = _originalData.end_at;
            $scope.workshop.max_participants = _originalData.max_participants;

            $scope.loading = false;
        }, function (httpResponse) {
            if (httpResponse.status === 404)
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOPTEMPLATE_NOT_FOUND,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });

            $scope.loading = false;
        });
    }
]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:EnrollmentConfirmCtrl
 * @description Controller for showing enrollment confirm
 */
mainAppCtrls.controller('EnrollmentConfirmCtrl', ['$scope', 'Workshops', '$stateParams', '$alert', '$translate',
    function ($scope, Workshops, $stateParams, $alert, $translate) {
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['TITLE_ERROR', 'TITLE_SUCCESS', 'ALERT_NOT_FOUND_WORKSHOP', 'ALERT_SUCCESSFULLY_ENROLLED_WORKSHOP', 'ALERT_INVALID_ENROLMENT_LINK']).
            then(function (translations) {
                _translations = translations;
            });

        $scope.workshop = {};
        $scope.loading = true;
        Workshops.getWorkshop({id: $stateParams.workshopid}).$promise.then(function (value) {
            $scope.workshop = value;
            var _ea = Date.parse($scope.workshop.end_at);
            var _sa = Date.parse($scope.workshop.start_at);
            $scope.workshop.duration = new Date(_ea - _sa);

        }, function (value) {
            $alert({
                container: '#alert',
                dismissable: false,
                show: true,
                title: _translations.TITLE_ERROR,
                content: _translations.ALERT_NOT_FOUND_WORKSHOP,
                type: 'danger'
            });
        });
        Workshops.confirmEnroll({
            id: $stateParams.workshopid,
            userid: $stateParams.userid,
            token: $stateParams.token
        }).$promise.then(function (value) {
                console.log(value);
                switch (value.code) {
                    case 200:
                        $alert({
                            container: '#alert',
                            dismissable: false,
                            show: true,
                            title: _translations.TITLE_SUCCESS,
                            content: _translations.ALERT_SUCCESSFULLY_ENROLLED_WORKSHOP + '\"' + $scope.workshop.title + '\"',
                            type: 'success'
                        });
                        break;
                    case 201:
                        $alert({
                            container: '#alert',
                            dismissable: false,
                            show: true,
                            title: _translations.TITLE_SUCCESS,
                            content: value.message + '\"' + $scope.workshop.title + '\"',
                            type: 'success'
                        });
                        break;
                }
                $scope.loading = false;
            }, function (httpResponse) {
                switch (httpResponse.code) {
                    case 404:
                        $alert({
                            container: '#alert',
                            dismissable: false,
                            show: true,
                            title: _translations.TITLE_ERROR,
                            content: _translations.ALERT_INVALID_ENROLMENT_LINK,
                            type: 'danger'
                        });
                        break;
                }
                $scope.loading = false;
            });
    }

]);
/**
 * Created by hunte on 08/06/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:LegalNoticeCtrl
 * @description Controller for showing legal notice
 */
mainAppCtrls.controller('LegalNoticeCtrl', ['$scope', 'Admin', '$sanitize',
    function ($scope, Admin, $sanitize) {
        Admin.getLegalNotice().$promise.then(function (response) {
            $scope.legalNotice = response.content;
        }, function (response) {
        });
    }

]);
/**
 * Created by hunte on 31/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:LoginCtrl
 * @description Controller handling the login process. Associated with the login view
 */
mainAppCtrls.controller('LoginCtrl', ['$scope', '$http', 'store', '$state', 'jwtHelper', '$alert', '$translate', 'Admin',
    function ($scope, $http, store, $state, jwtHelper, $alert, $translate, Admin) {
        $scope.reset_panel = false;
        var jwt = store.get('jwt');
        $scope.reset = {};

        var _translations;
        $translate(['TITLE_ERROR', 'ALERT_LOGIN_FAIL', 'ALERT_RESET_EMAIL_ERROR', 'TITLE_SUCCESS',
            'ALERT_RESET_PASSWORD_SUCCESS', 'ALERT_RESET_PASSWORD_ERROR' ]).then(function (translation) {
            _translations = translation;
        })

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:LoginCtrl#sendInfo
         * @description Sends password and username to the server and checks confirms validation
         * @methodOf mainAppCtrls.controller:LoginCtrl
         */
        $scope.sendInfo = function () {
            var _data = {
                _username: $scope.e_mail,
                _password: $scope.password
            };
            $scope.alertError;
            $scope.loading = true;
            if ($scope.alertError != null)
                $scope.alertError.hide();
            $http({method: 'POST', url: '/api/login_check', data: _data}).then(function (httpResponse) {
                $scope.loading = false;
                var token = httpResponse.data.token;
                store.set('jwt', token);
                $state.go('dashboard');
                $scope.show_login = false;
                $scope.show_logout = true;
            }, function (httpResponse) {
                $scope.loading = false;

                $scope.alertError = $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    container: '#alert',
                    content: _translations.ALERT_LOGIN_FAIL,
                    dismissable: false,
                    show: true
                });
            });
        };

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:LoginCtrl#showResetPanel
         * @description shows the button to reset the password
         * @methodOf mainAppCtrls.controller:LoginCtrl
         */
        $scope.showResetPanel = function () {
            $scope.reset_panel = !$scope.reset_panel;
        }
        $scope.alertReset = $alert({});
        $scope.resetPassword = function () {
            $scope.alertReset.hide();
            if (!$scope.reset.email) {
                $scope.alertReset = $alert({
                    title: _translations.TITLE_ERROR,
                    content: _translations.ALERT_RESET_EMAIL_ERROR,
                    type: 'danger',
                    dismissable: false,
                    show: true,
                    container: '#reset_alert'
                });
                return;
            }
            if ($scope.alertReset != null)
                $scope.alertReset.hide();
            Admin.requestReset({email: $scope.reset.email}).$promise.then(function (response) {
                $scope.alertReset = $alert({
                    title: _translations.TITLE_SUCCESS,
                    content: _translations.ALERT_RESET_PASSWORD_SUCCESS,
                    type: 'success',
                    dismissable: false,
                    show: true,
                    container: '#reset_alert'
                });
            }, function (response) {
                $scope.alertReset = $alert({
                    title: _translations.TITLE_ERROR,
                    content: _translations.ALERT_RESET_PASSWORD_ERROR,
                    type: 'danger',
                    dismissable: false,
                    show: true,
                    container: '#reset_alert'
                });
            });
        }
    }
]);
/**
 * Created by hunte on 31/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:NewEmailTemplateCtrl
 * @description Controller to create a new email template
 * @requires restSvcs.EmailTemplate
 */
mainAppCtrls.controller('NewEmailTemplateCtrl', ['$scope', "EmailTemplate", '$translate', '$alert', '$state',
    function ($scope, EmailTemplate, $translate, $alert, $state) {

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_EMAILTEMPLATE_NEW_SUCCESS',
            'ALERT_EMAILTEMPLATE_NEW_FAIL', 'ALERT_EMAILTEMPLATE_NOT_FOUND', 'TITLE_ERROR', 'TITLE_SUCCESS']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:NewEmailTemplateCtrl#sendInfo
         * @description Sends the data of the created email template to the server
         * @methodOf mainAppCtrls.controller:NewEmailTemplateCtrl
         */
        $scope.sendInfo = function () {
            var data = {
                template_name: $scope.email.template.title,
                email_subject: $scope.email.template.subject,
                email_body: $scope.email.template.body
            }

            EmailTemplate.put(data).$promise.then(function (httpResponse) {

                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_EMAILTEMPLATE_NEW_SUCCESS + ' \"' + data.template_name + '\"',
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
            }, function (httpResponse) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_EMAILTEMPLATE_NEW_FAIL + ' (' + httpResponse.status + ')',
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                $state.go("email_template");
            });
        }
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:NewEmailTemplateCtrl#discard
         * @description Discards all data of the document
         * @methodOf mainAppCtrls.controller:NewEmailTemplateCtrl
         */
        $scope.discard = function () {
            $scope.email.template.title = "";
            $scope.email.template.subject = "";
            $scope.email.template.body = "";

        }

    }

]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:NewWorkshopTemplateCtrl
 * @description Controller initializing the creation of a new workshop template
 * @requires restSvcs.WorkshopTemplate
 */
mainAppCtrls.controller('NewWorkshopTemplateCtrl', ['$scope', "WorkshopTemplate", '$translate', '$alert', '$state',
    function ($scope, WorkshopTemplate, $translate, $alert, $state) {
        $scope.workshop = {};
        $scope.myAlert = $alert({});

        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOPTEMPLATE_NEW_SUCCESS',
            'ALERT_WORKSHOPTEMPLATE_NEW_FAIL', 'ALERT_WORKSHOPTEMPLATE_NOT_FOUND', 'TITLE_ERROR', 'TITLE_SUCCESS']).
            then(function (translations) {
                _translations = translations;
            });
        $scope.workshop.duration = -3600000;
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:NewWorkshopTemplateCtrl#sendInfo
         * @methodOf mainAppCtrls.controller:NewWorkshopTemplateCtrl
         * @description Validates the input data and sends a request to create a new Template to the server
         *
         */
        $scope.sendInfo = function () {
            //Adjusts the format of the date strings to fit the requirements of the API
            var reformatDate = function (_date) {
                if (_date == null)
                    return "";
                var str = _date.getFullYear() + "-" + (_date.getMonth() + 1) + "-" + _date.getDate() + " ";
                if (_date.getHours() < 10)
                    str += "0";
                str += _date.getHours() + ":";
                if (_date.getMinutes() < 10)
                    str += "0";
                str += _date.getMinutes() + ":";
                if (_date.getSeconds() < 10)
                    str += "0";
                str += _date.getSeconds();
                return str;
            };

            //Initialize start_at to calculate duration with end_at 
            var _sa = new Date(0);
            var _duration = $scope.workshop.duration;
            var _ea = new Date(_duration);
            var error = false;
            if ($scope.workshop.cost < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_COST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if ($scope.workshop.max_participants < 0) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_NEGATIVE_PARTICIPANTS,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }
            var now = new Date();
            if ($scope.workshop.start_at < now) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_WORKSHOP_IN_PAST,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
                error = true;
            }

            if (error)
                return false;

            var data = {
                title: $scope.workshop.title,
                description: $scope.workshop.description,
                cost: $scope.workshop.cost,
                requirements: $scope.workshop.requirement,
                location: $scope.workshop.location,
                start_at: reformatDate(_sa),
                end_at: reformatDate(_ea),
                max_participants: $scope.workshop.max_participants
            };

            if ($scope.myAlert != null)
                $scope.myAlert.hide();
            WorkshopTemplate.put(data).$promise.then(function (httpResponse) {
                $scope.myAlert = $alert({
                    container: '#alert',
                    type: 'success',
                    title: _translations.TITLE_SUCCESS,
                    content: _translations.ALERT_WORKSHOPTEMPLATE_NEW_SUCCESS + ' \"' + data.title + '\"',
                    show: true,
                    dismissable: false
                });
                $state.go("workshop_template");
            }, function (httpResponse) {
                $scope.myAlert = $alert({
                    container: '#alert',
                    type: 'danger',
                    title: _translations.TITLE_ERROR,
                    content: _translations.ALERT_WORKSHOPTEMPLATE_NEW_FAIL + ' (' + httpResponse.status + ')',
                    show: true,
                    dismissable: false
                });
            });
        };
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:NewWorkshopTemplateCtrl#discard
         * @methodOf mainAppCtrls.controller:NewWorkshopTemplateCtrl
         * @description Discards the input
         *
         */
        $scope.discard = function () {
            $scope.workshop.title = "";
            $scope.workshop.description = "";
            $scope.workshop.cost = "";
            $scope.workshop.requirement = "";
            $scope.workshop.location = "";
            $scope.workshop.sharedDate = "";
            $scope.workshop.duration = "";
            $scope.workshop.max_participants = "";

        }

    }

]);
/**
 * Created by hunte on 31/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:PasswordResetCtrl
 * @description To reset your password and create a new password
 * @requires restSvcs.Admin
 */
mainAppCtrls.controller('PasswordResetCtrl', ['$scope', '$alert', '$translate', 'Admin', '$stateParams',
    function ($scope, $alert, $translate, Admin, $stateParams) {

        $scope.form = {};
        var _translations;
        $translate(['TITLE_ERROR', 'TITLE_SUCCESS', 'PASSWORDS_IDENTICAL_ERROR', 'PASSWORD_EMPTY_ERROR']).then(function (translations) {
            _translations = translations;
        });
        var pwAlert;
        var _token = $stateParams.token;
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:PasswordResetCtrl#validatePW
         * @methodOf mainAppCtrls.controller:PasswordResetCtrl
         * @description checks validity of passwords ( if both are identical )
         */
        $scope.validatePW = function () {
            var pw = $scope.password;
            var pwc = $scope.password_confirm;
            if (pwAlert != null) {
                pwAlert.hide();
                pwAlert.destroy();
            }
            if (pw != pwc) {
                pwAlert = $alert({
                    container: '#alert',
                    title: _translations.TITLE_ERROR,
                    content: _translations.PASSWORDS_IDENTICAL_ERROR,
                    show: true,
                    dismissable: false,
                    type: 'danger'
                });
                return false;
            } else {
                if (pwAlert != null) {
                    pwAlert.hide();
                    pwAlert.destroy();
                }
                return true;
            }
        };
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:PasswordResetCtrl#sendInfo
         * @methodOf mainAppCtrls.controller:PasswordResetCtrl
         * @description checks validity and sends a request to change the password to the server
         */
        $scope.sendInfo = function () {
            if (!$scope.validatePW())
                return;

            var pw = $scope.password;
            if (pw == '' || pw == null) {
                pwAlert = $alert({
                    container: '#alert',
                    title: _translations.TITLE_ERROR,
                    content: _translations.PASSWORD_EMPTY_ERROR,
                    show: true,
                    dismissable: false,
                    type: 'danger'
                });
                return;
            }
            var _msg = "";
            var _type = "";
            var _title = "";
            Admin.resetPassword({token: _token, password: $scope.password}).$promise.then(function (httpResponse) {
                pwAlert = $alert({
                    container: '#alert',
                    title: _translations.TITLE_SUCCESS,
                    content: _msg,
                    type: "success",
                    show: true,
                    dismissable: false
                });
            }, function (httpResponse) {
                switch (httpResponse.status) {
                    case 404:
                        _msg = "Invalid token";
                        break;
                    case 500:
                        _msg = "Internal server error. Please contact your system admin";
                        break;
                }
                pwAlert = $alert({
                    container: '#alert',
                    title: _translations.TITLE_ERROR,
                    content: _msg,
                    type: "danger",
                    show: true,
                    dismissable: false
                });

            });

        };
    }

]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:SettingsCtrl
 * @description Controller for the Settings view
 */
mainAppCtrls.controller('SettingsCtrl', ['$scope', '$alert', '$confirm', 'Admin', '$translate',
    function ($scope, $alert, $confirm, Admin, $translate) {
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_PASSWORD_IDENTICAL', 'AlERT_PASSWORD_EMPTY', 'CHANGE_PERSONAL_INFO', 'CHANGE_CONTACT_INFO', 'EDIT_LEGAL_NOTICE', 'TITLE_SUCCESS', 'TITLE_ERROR']).
            then(function (translations) {
                _translations = translations;
                $scope.tabs = [

                    {
                        title: _translations.CHANGE_PERSONAL_INFO,
                        page: "resources/views/adminEditPassword.html"
                    },
                    {
                        title: _translations.CHANGE_CONTACT_INFO,
                        page: "resources/views/adminEditInfo.html"
                    },
                    {
                        title: _translations.EDIT_LEGAL_NOTICE,
                        page: "resources/views/adminEditLegalNotice.html"
                    }
                ];
            });
        var _originalData = {};
        $scope.form = {};
        $scope.ln = {};

        $scope.lnToolbar = [
            ['h1', 'h2', 'h3', 'p', 'bold', 'italics'],
            ['ul', 'ol'],
            ['redo', 'undo', 'clear'],
            ['html', 'insertImage', 'insertLink'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent']
        ];

        var _originalNotice = "";
        Admin.getLegalNotice().$promise.then(
            function (value) {
                $scope.ln.legalNotice = value.content;
                _originalNotice = value.content;
            }, function (value) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: value.message,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
            });

        Admin.getContact().$promise.then(
            function (value) {
                $scope.form = value.content;
            }, function (value) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: value.message,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
            }
        );

        $scope.pwAlert = null;
        $scope.emailAlert = null;

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:SettingsCtrl#validatePW
         * @methodOf mainAppCtrls.controller:SettingsCtrl
         * @returns {boolean} True when valid, false when not. Used internally
         */
        $scope.validatePW = function () {
            var pw = $scope.form.password;
            var pwc = $scope.form.password_confirm;
            if (pw != pwc) {
                if ($scope.pwAlert != null)
                    $scope.pwAlert.hide();
                $scope.pwAlert = $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_PASSWORD_IDENTICAL,
                    container: '#pwalert',
                    dismissable: false,
                    show: true
                });
                return false;
            } else {
                if ($scope.pwAlert != null)
                    $scope.pwAlert.hide();
                return true;
            }
        };

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:SettingsCtrl#changePassword
         * @methodOf mainAppCtrls.controller:SettingsCtrl
         * @description Checks validity of password and sends request to change it to the servers
         */
        $scope.changePassword = function () {
            if (!$scope.validatePW())
                return;
            if ($scope.form.password == null || $scope.form.password == '') {
                if ($scope.pwAlert != null)
                    $scope.pwAlert.hide();
                $scope.pwAlert = $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.AlERT_PASSWORD_EMPTY,
                    container: '#pwalert',
                    dismissable: false,
                    show: true
                });
                return;
            }
            var _data = {
                oldpassword: $scope.form.password_old,
                newpassword: $scope.form.password,
            };
            Admin.changePassword(_data).$promise.then(function (value) {
                if ($scope.pwAlert != null)
                    $scope.pwAlert.hide();

                $scope.pwAlert = $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: value.message,
                    container: '#pwalert',
                    dismissable: false,
                    show: true
                });
                $scope.form = {};
            }, function (value) {
                if ($scope.pwAlert != null)
                    $scope.pwAlert.hide();

                $scope.pwAlert = $alert({
                    title: _translations.TITLE_ALERT,
                    type: 'danger',
                    content: value.data.message,
                    container: '#pwalert',
                    dismissable: false,
                    show: true
                });
                $scope.form = {};
            });

        };
        /**
         * @ngdoc function
         * @name  mainAppCtrls.controller:SettingsCtrl#changeEmail
         * @methodOf mainAppCtrls.controller:SettingsCtrl
         * @description checks validity of email and sends request to change it to the server
         */
        $scope.changeEmail = function () {
            if ($scope.emailAlert != null)
                $scope.emailAlert.hide();
            var _email_new = $scope.form.email_new;
            var _email_old = $scope.form.email_old;
            if (_email_new == null || _email_new == '') {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_EMAIL_EMPTY,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
            }
            if (_email_old == null || _email_old == '') {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.ALERT_OLDEMAIL_EMPTY,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
            }
            Admin.changeEmail({oldemail: _email_old, newemail: _email_new}).$promise.then(function (response) {
                $scope.emailAlert = $alert({
                    content: response.statusText,
                    type: 'success',
                    title: _translations.TITLE_SUCCESS,
                    show: true,
                    dismissable: false,
                    duration: 30,
                    container: '#emailAlert'
                });
                $scope.form = {};
            }, function (response) {
                $scope.emailAlert = $alert({
                    content: response.statusText,
                    type: 'danger',
                    title: _translations.TITLE_ERROR,
                    show: true,
                    dismissable: false,
                    duration: 30,
                    container: '#emailAlert'
                });
                $scope.form = {};
            });

        };

        $scope.saveLegalNotice = function () {

            var _dataToSend = {
                content: $scope.ln.legalNotice
            };
            console.log(_dataToSend.content);
            Admin.editLegalNotice(_dataToSend).$promise.then(function (value) {
                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: value.statusText,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
                $scope.legalNotice = value.content;
            }, function (value) {
                $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: value.statusText,
                    container: '#alertInfo',
                    dismissable: false,
                    show: true
                });
            });
        };
        $scope.discardLegalNotice = function () {
            $scope.ln.legalNotice = _originalNotice;
        };

        /**
         * @ngdoc function
         * @name  mainAppCtrls.controller:SettingsCtrl#discardContact
         * @methodOf mainAppCtrls.controller:SettingsCtrl
         * @description discards changes made to the contact data
         */
        $scope.discardContact = function () {
            $scope.form.telephone = _originalData.telephone;
            $scope.form.website = _originalData.website;
            $scope.form.address = _originalData.address;
            $scope.form.facebook = _originalData.facebook;
            $scope.form.email = _originalData.email;
        };
        /**
         * @ngdoc function
         * @name  mainAppCtrls.controller:SettingsCtrl#saveContactChange
         * @methodOf mainAppCtrls.controller:SettingsCtrl
         * @description checks validity of changes made to input and sends change request to server
         */
        $scope.saveContactChange = function () {
            var _dataToSend = {
                content: angular.toJson($scope.form)
            };

            Admin.editContact(_dataToSend).$promise.then(
                function (value) {
                    $alert({
                        title: _translations.TITLE_SUCCESS,
                        type: 'success',
                        content: value.message,
                        container: '#alertInfo',
                        dismissable: false,
                        show: true
                    });
                },
                function (value) {
                    $alert({
                        title: _translations.TITLE_ERROR,
                        type: 'danger',
                        content: value.message,
                        container: '#alertInfo',
                        dismissable: false,
                        show: true
                    });
                });
        }
    }
]);
/**
 * Created by hunte on 30/05/2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:UnsubscribeCtrl
 * @description Providing resources used to complete unsubscription from a workshop
 */
mainAppCtrls.controller('UnsubscribeCtrl', ['$scope', 'Workshops', '$stateParams', '$translate', '$alert',
    function ($scope, Workshops, $stateParams, $translate, $alert) {

        //Define used variables
        var _userId = $stateParams.id;
        var _workshopId = $stateParams.workshopid;
        var _token = $stateParams.token;

        $scope.workshop = {};
        $scope.alertUnsub = $alert({});

        //get and store translations for errors
        var _translations = {};
        $translate(['TITLE_ERROR', 'TITLE_SUCCESS', 'ALERT_WORKSHOP_NOT_FOUND', 'UNSUBSCRIBE_CONFIRM_ERROR', 'UNSUBSCRIBE_CONFIRM_SUCCESS']).then(function (translations) {
            _translations = translations;
        });
        $scope.confirm = function () {
            var _params = {
                id: _workshopId,
                token: _token,
                participantId: _userId
            };
            $scope.working = true;
            Workshops.unsubscribeConfirm(_params).$promise.then(function (response) {
                $scope.alertUnsub.hide();
                $scope.alertUnsub = $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.UNSUBSCRIBE_CONFIRM_SUCCESS,
                    show: true,
                    container: '#alert',
                    dismissable: false
                });
                $scope.working = false;
            }, function (response) {
                $scope.alertUnsub.hide();
                $scope.alertUnsub = $alert({
                    title: _translations.TITLE_ERROR,
                    type: 'danger',
                    content: _translations.UNSUBSCRIBE_CONFIRM_ERROR,
                    show: true,
                    container: '#alert',
                    dismissable: false
                });
                $scope.working = false;
            });
        }

        //Load workshop to display additional data
        $scope.loading = true;
        $scope.error = false;
        Workshops.getWorkshop({id: _workshopId}).$promise.then(function (response) {
            $scope.workshop = response;
            var _ea = Date.parse($scope.workshop.end_at);
            var _sa = Date.parse($scope.workshop.start_at);

            $scope.workshop.duration = new Date(_ea - _sa);
            $scope.loading = false;
        }, function (response) {
            $scope.alertUnsub.hide();
            $scope.alertUnsub = $alert({
                title: _translations.TITLE_ERROR,
                type: 'danger',
                content: _translations.ALERT_WORKSHOP_NOT_FOUND,
                show: true,
                container: '#alert',
                dismissable: false
            });
            $scope.loading = false;
            $scope.error = true;
        });
    }
]);
/**
 * Created by Ahmet on 31.05.2016.
 */
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:WorkshopDetailsCtrl
 * @description Loads workshop details
 * @requires restSvcs.Workshops
 */
mainAppCtrls.controller('WorkshopDetailsCtrl', ['$scope', 'Workshops', '$stateParams', "$alert", "$translate",
    function ($scope, Workshops, $stateParams, $alert, $translate) {
        $scope.unsub = {};
        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_ENROLLMENT_SUCCESSFULL', 'ALERT_NO_PARTICIPANTS', 'FIRST_NAME', 'LAST_NAME', 'EMAIL'
            , 'ALERT_INTERNAL_SERVER_ERROR', 'ALERT_ALREADY_ENROLLED', 'TITLE_SUCCESS', 'TITLE_ERROR', 'ALERT_YOU_ARE_ON_BLACKLIST', 'ERROR_UNSUBSCRIBE_FAIL',
            'UNSUBSCRIBE_SUCCESS']).
            then(function (translations) {
                _translations = translations;
                $scope.placeholder = {
                    firstname: _translations.FIRST_NAME,
                    lastname: _translations.LAST_NAME,
                    emailadress: _translations.EMAIL
                };

            });

        //TODO : replace with workshop details
        var workshopid = $stateParams.id;
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:WorkshopDetailsCtrl#sendInfo
         * @description Sends the info entered for enrollment to the server
         * @methodOf mainAppCtrls.controller:WorkshopDetailsCtrl
         */
        $scope.sendInfo = function () {
            var first_name = $scope.first_name;
            var last_name = $scope.last_name;
            var _email = $scope.e_mail;

            //check if input is valid
            var _data = {
                //Data to be send
                name: first_name,
                surname: last_name,
                email: _email
            };
            //parameters for url
            var _params = {
                id: workshopid
            };
            Workshops.enroll(_params, _data).$promise.then(function (value, httpResponse) {

                $alert({
                    title: _translations.TITLE_SUCCESS,
                    type: 'success',
                    content: _translations.ALERT_ENROLLMENT_SUCCESSFULL,
                    container: '#alertEnroll',
                    dismissable: true,
                    duration: 20,
                    show: true,
                    animation: 'am-fade-and-slide-top'
                });
            }, function (response) {
                var _msg = "";
                switch (response.status) {
                    case 403:
                        $translate(response.data.message).then(function (_translation) {
                            console.log(response.data.message);
                            $translate(response.data.message).then(function (_translation) {
                                $alert({
                                    type: 'danger',
                                    title: _translations.TITLE_ERROR,
                                    content: _translation,
                                    show: true,
                                    duration: 20,
                                    container: '#alertEnroll',
                                    dismissable: true
                                });
                            });
                        });
                        break;
                    case 500:
                        $alert({
                            type: 'danger',
                            title: _translations.TITLE_ERROR,
                            content: _translations.ALERT_INTERNAL_SERVER_ERROR,
                            show: true,
                            duration: 20,
                            container: '#alertEnroll',
                            dismissable: true
                        });
                        ;
                        break;
                    default:
                        $alert({
                            type: 'danger',
                            title: _translations.TITLE_ERROR,
                            content: response.data.message,
                            show: true,
                            duration: 20,
                            container: '#alertEnroll',
                            dismissable: true
                        });

                }

            });
        };

        $scope.unsubscribe = function () {
            var _data = {
                email: $scope.unsub.e_mail,
                workshopId: workshopid
            }
            Workshops.unsubscribe(_data).$promise.then(function (response) {
                $alert({
                    type: 'success',
                    title: _translations.TITLE_SUCCESS,
                    content: _translations.UNSUBSCRIBE_SUCCESS,
                    dismissable: true,
                    duration: 20,
                    show: true,
                    container: '#alertEnroll'
                });
            }, function (response) {
                var _msg = "";
                switch (response.status) {
                    case 404:
                        console.log(response.data.message);
                        $translate(response.data.message).then(function (_translation) {
                            $alert({
                                type: 'danger',
                                title: _translations.TITLE_ERROR,
                                content: _translation,
                                show: true,
                                duration: 20,
                                container: '#alertEnroll',
                                dismissable: true
                            });
                        });
                        break;
                    default:
                        $alert({
                            type: 'danger',
                            title: _translations.TITLE_ERROR,
                            content: _translations.ERROR_UNSUBSCRIBE_FAIL + ": " + response.statusText,
                            show: true,
                            duration: 20,
                            container: '#alertEnroll',
                            dismissable: true
                        });
                }
            });
        };

        $scope.loading = true;
        Workshops.get({id: workshopid}).$promise.then(function (value) {
            $scope.workshop = value;

            var _ea = Date.parse($scope.workshop.end_at);
            var _sa = Date.parse($scope.workshop.start_at);
            var _durationInMs = _ea - _sa;
            // calculate duration in hh:mm
            var _duration = ("0" + Math.floor(_durationInMs/(1000*60*60))).slice(-2) + ":" +
                ("0" + Math.floor((_durationInMs%(1000*60*60))/(1000 * 60))).slice(-2);
            $scope.workshop.duration = _duration;

            $scope.loading = false;
        }, function (httpResponse) {
            alert(httpResponse.status + '');
            $scope.loading = false;
        });
        $scope.loading = true;
        Workshops.getParticipants({id: workshopid}).$promise.then(function (value, httpResponse) {
            $scope.participants = value;

            $scope.loading = false;
        }, function (httpResponse) {
            switch (httpResponse.status) {
                case 404:
                    $alert({
                        title: '',
                        type: 'info',
                        content: _translations.ALERT_NO_PARTICIPANTS,
                        container: '#alertParticipant',
                        dismissable: false,
                        show: true,
                        animation: 'am-fade-and-slide-top'
                    });
            }
            $scope.loading = false;
        });
        $scope.loading = true;
        Workshops.getWaitinglist({id: workshopid}).$promise.then(function (response) {
            $scope.waitingList = response;
            $scope.loading = false;
        }, function (response) {
            $scope.loading = false;
        });

    }
]);
var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:WorkshopListCtrl
 * @description Controller initilasing the workshopList view
 * @requires restSvcs.Workshops
 */
mainAppCtrls.controller('WorkshopListCtrl', ['$scope', 'Workshops', '$alert', '$translate',
    function ($scope, Workshops, $alert, $translate) {

        //Define object to store the alert in
        $scope.myAlert;
        //Get and store translation for alert title.
        $translate(['TITLE_ERROR', 'ERROR_NO_WORKSHOPS', 'EMPTY_WORKSHOP', 'ALERT_INTERNAL_SERVER_ERROR', 'TITLE_INFO']).then(function (translations) {
            $scope.errorTitle = translations.TITLE_ERROR;
            $scope.errorMsg = translations.ERROR_NO_WORKSHOPS;
            $scope.emptyMsg = translations.EMPTY_WORKSHOP;
            $scope.InternalServerError = translations.ALERT_INTERNAL_SERVER_ERROR;
            $scope.infoTitle = translations.TITLE_INFO;
        });
        $scope.loading = true;
        Workshops.getAll().$promise.then(function (value) {
            $scope.workshopList = value;
            $scope.loading = false;
            // show info, if no workshop found
            if(value.length == 0) {
                $scope.myAlert = $alert({
                    title: $scope.infoTitle,
                    type: 'info',
                    content: $scope.errorMsg,
                    container: '#alert',
                    dismissable: false,
                    show: true
                });
            }
        }, function (httpResponse) {
            //switch through all possible errors
            switch (httpResponse.status) {
                //Alert for error 404, no workshops available
                case 404:
                    $scope.myAlert = $alert({
                        title: $scope.errorTitle,
                        type: 'danger',
                        content: $scope.errorMsg,
                        container: '#alert',
                        dismissable: false,
                        show: true
                    });
                    break;
                case 500:
                    $scope.myAlert = $alert({
                        title: $scope.errorTitle,
                        type: 'danger',
                        content: $scope.InternalServerError,
                        container: '#alert',
                        dismissable: false,
                        show: true
                    });
                    break;
            }
            $scope.loading = false;
        });

    }
]);
/**
 * Created by hunte on 31/05/2016.
 */

var mainAppCtrls = angular.module("mainAppCtrls");
/**
 * @ngdoc controller
 * @name mainAppCtrls.controller:WorkshopTemplateCtrl
 * @description Displays the workshop-template list in the associated view
 * @requires restSvcs.WorkshopTemplate
 */
mainAppCtrls.controller('WorkshopTemplateCtrl', ['$scope', "WorkshopTemplate", '$translate', '$alert',

    function ($scope, WorkshopTemplate, $translate, $alert) {


        //Get translations for errors and store in array
        var _translations = {};
        //Pass all required translation IDs to translate service
        $translate(['ALERT_WORKSHOPTEMPLATE_LIST_EMPTY',
            'ALERT_WORKSHOPTEMPLATE_DELETED_SUCCESS', 'ALERT_WORKSHOPTEMPLATE_DELETED_FAIL', 'TITLE_SUCCESS', 'TITLE_ERROR', 'TITLE_WARNING']).
            then(function (translations) {
                _translations = translations;
            });

        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:WorkshopTemplateCtrl#loadTemplates
         * @methodOf mainAppCtrls.controller:WorkshopTemplateCtrl
         * @description Loads the list of available Templates from the server
         */
        var loadTemplates = function () {
            $scope.loading = true;
            WorkshopTemplate.getAll()
                .$promise.then(function (value) {
                    $scope.data = value;
                    $scope.loading = false;

                }, function (httpResponse) {
                    if (httpResponse.status == 404) {
                        $scope.data = {}
                        $alert({
                            title: _translations.TITLE_WARNING,
                            type: 'warning',
                            container: '#alert',
                            show: true,
                            dismissable: false,
                            content: _translations.ALERT_WORKSHOPTEMPLATE_LIST_EMPTY + ' (' + httpResponse.status + ')',
                        })
                    }
                    $scope.loading = false;
                });
        };
        loadTemplates();
        /**
         * @ngdoc function
         * @name mainAppCtrls.controller:WorkshopTemplateCtrl#delete
         * @methodOf mainAppCtrls.controller:WorkshopTemplateCtrl
         * @param {number} _id id of the workshop, which should be deleted
         * @description Deletes the template with the passed id
         */
        $scope.delete = function (_id) {
            WorkshopTemplate.delete({id: _id}).$promise.then(function (httpresponse) {
                    $alert({
                        title: _translations.TITLE_SUCCESS,
                        type: 'success',
                        container: '#alert',
                        show: true,
                        dismissable: false,
                        content: _translations.ALERT_WORKSHOPTEMPLATE_DELETED_SUCCESS,
                        duration: 20
                    });
                    loadTemplates();
                }
                , function (httpResponse) {
                    $alert({
                        title: _translations.TITLE_ERROR,
                        type: 'danger',
                        content: _translations.ALERT_WORKSHOPTEMPLATE_DELETED_FAIL + ' (' + httpResponse.status + ')',
                        container: '#alert',
                        dismissable: false,
                        show: true
                    });
                }
            )

        }

    }

]);




