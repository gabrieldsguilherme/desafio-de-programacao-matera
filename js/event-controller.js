var app = angular.module('matera', []);

app.controller('EventController', function($scope) {
	$scope.events = [];

	$scope.getAllEvents = function() {
	   	gapi.client.calendar.events.list({
			'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 20,
            'orderBy': 'startTime'
        }).then(function(response) {
        	let eventList = response.result.items;
        	$scope.events = eventList.filter(checkClass);
            $scope.$apply();
        });
	};

	$scope.getEventsWithNoTeacher = function() {
	   	gapi.client.calendar.events.list({
			'calendarId': 'primary',
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 20,
            'orderBy': 'startTime'
        }).then(function(response) {
        	let eventList = response.result.items;
        	$scope.events = eventList.filter(checkClassWithNoTeacher);
            $scope.$apply();
        });
	};

	$scope.eventDetails = function(event) {
		$scope.event = event;
		$('#eventDetailsModal').modal('show');
	}

	$scope.openInMap = function(location) {
		let url = 'http://maps.google.com/?q=' + location;
		window.open(url, '_blank');
	}

	$scope.editDescription = function(event) {
		$scope.event = event;
		$('#editDescriptionModal').modal('show');
	}

	$scope.updateEvent = function(event) {
		gapi.client.calendar.events.update({
			'calendarId': 'primary',
			'eventId': event.id,
			'resource': event
		}).then(function(response) {
			$('#editDescriptionModal').modal('hide');
		});
	}

	function checkClass(event) {
		return event.summary.indexOf('Educa+') !== -1 && event.summary.indexOf('SEM PROFESSOR') == -1;
	}

	function checkClassWithNoTeacher(event) {
		return event.summary.indexOf('Educa+') !== -1 && event.summary.indexOf('SEM PROFESSOR') !== -1;
	}
});