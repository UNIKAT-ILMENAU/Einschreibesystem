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