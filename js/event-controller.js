var app = angular.module('matera', []);

app.controller('EventController', function($scope) {
	$scope.events = [];

	$scope.getAllEvents = function() {
		let dateMin = new Date();
		dateMin.setDate(dateMin.getDate() - 365);
		
		let dateMax = new Date();
		dateMax.setDate(dateMax.getDate() + 365);

	   	gapi.client.calendar.events.list({
			'calendarId': 'primary',
            'timeMin': (dateMin).toISOString(),
            'timeMax': (dateMax).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 200000000,
            'orderBy': 'startTime'
        }).then(function(response) {
        	let eventList = response.result.items;
        	let events = eventList.filter(checkClass);

        	for (var i = 0; i < events.length; i++) {
        		if (events[i].attendees !== undefined) {
        			for (var j = 0; j < events[i].attendees.length; j++) {
		        		if (events[i].attendees[j].responseStatus == 'accepted') {
		        			events[i].teacher = events[i].attendees[j].displayName;
		        			break;
		        		}
		        	}
	        	}
        	}

			$scope.events = events;
            $scope.$apply();
        });
	};

	$scope.getEventsWithNoTeacher = function() {
		let dateMin = new Date();
		dateMin.setDate(dateMin.getDate() - 365);
		
		let dateMax = new Date();
		dateMax.setDate(dateMax.getDate() + 365);

	   	gapi.client.calendar.events.list({
			'calendarId': 'primary',
            'timeMin': (dateMin).toISOString(),
            'timeMax': (dateMax).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 200000000,
            'orderBy': 'startTime'
        }).then(function(response) {
        	let eventList = response.result.items;
        	$scope.events = eventList.filter(checkClassWithNoTeacher);
            $scope.$apply();
        });
	};

	$scope.getMyEvents = function() {
		let dateMin = new Date();
		dateMin.setDate(dateMin.getDate() - 365);
		
		let dateMax = new Date();
		dateMax.setDate(dateMax.getDate() + 365);

	   	gapi.client.calendar.events.list({
			'calendarId': 'primary',
            'timeMin': (dateMin).toISOString(),
            'timeMax': (dateMax).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 200000000,
            'orderBy': 'startTime'
        }).then(function(response) {
        	let eventList = response.result.items;
        	let events = eventList.filter(checkMyClass);

        	for (var i = 0; i < events.length; i++) {
        		events[i].teacher = auth2.currentUser.get().getBasicProfile().getName();
        	}

        	$scope.events = events;
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

	$scope.showClassWithNoTeacher = function(event) {
		$scope.getEventsWithNoTeacher();
	}

	$scope.showAllEvents = function(event) {
		$scope.getAllEvents();
	}

	$scope.showMyClasses = function(event) {
		$scope.getMyEvents();
	}

	$scope.signOut = function() {
		$scope.signOut = true;
		$scope.events = [];
	}

	function checkClass(event) {
		return event.summary.indexOf('Educa+') !== -1 && event.summary.indexOf('SEM PROFESSOR') == -1;
	}

	function checkClassWithNoTeacher(event) {
		if (event.summary.indexOf('Educa+') !== -1) {
			if (event.attendees !== undefined) {
				for (var i = 0; i < event.attendees.length; i++) {
					if (event.attendees[i].responseStatus == 'accepted') {
						return false;
					}
				}
			}
			return true;
		}
		return false;
	}

	function checkMyClass(event) {
		auth2 = gapi.auth2.getAuthInstance();
		if (auth2.isSignedIn.get()) {
			let loggedEmail = auth2.currentUser.get().getBasicProfile().getEmail();
			if (event.summary.indexOf('Educa+') !== -1) {
				if (event.attendees !== undefined) {
					for (var i = 0; i < event.attendees.length; i++) {
						if (event.attendees[i].responseStatus == 'accepted' && event.attendees[i].email == loggedEmail) {
							return true;
						}
					}
				}
				return false;
			}
			return false;
		}
	}

});