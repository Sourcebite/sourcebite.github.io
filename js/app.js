;(function() {

  var app = {
    currentVersion: 0
  };
/*
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./service-worker.js')
      .then(function() { console.log('Service Worker Registered'); });
  }
*/

  var dayLessonTemplate = '<div class="day-lesson">'
                            +'<div class="lesson-order">{order}</div>'
                            +'<div class="lesson-time">{time}</div>'
                            +'<div class="lesson-subject">{subject}</div>'
                            +'<div class="lesson-room">{room}</div>'
                          +'</div>';

  var oddWeekDayLesson = '<div class="odd-week">{odd}</div>';
  var evenWeekDayLesson = '<div class="even-week">{even}</div>';

  app.updateScheduleView = function(schedule) {
    var dayBlocks = document.querySelectorAll('.week-table .day-table');
    schedule.days.forEach(function(day, dayIndex) {
      var dayLessons = '';
      day.pairs.forEach(function(pair) {
        dayLessons += dayLessonTemplate
          .replace('{order}', pair.order)
          .replace('{time}', pair.time);

        var subject = '';
        var room = '';

        console.log(pair.lesson);
        if(pair.lesson[0] != undefined) {
          subject += oddWeekDayLesson
            .replace('{odd}', pair.lesson[0].subject ? (pair.lesson[0].subject + ' [' + pair.lesson[0].type) + ']' : '');
          room += oddWeekDayLesson
            .replace('{odd}', pair.lesson[0].room ? (pair.lesson[0].room + ' ' + pair.lesson[0].building) : '');
        }
        if(pair.lesson[1] != undefined) {
          subject += evenWeekDayLesson
            .replace('{even}', pair.lesson[1].subject ? (pair.lesson[1].subject + ' [' + pair.lesson[1].type) + ']' : '');
          room += evenWeekDayLesson
            .replace('{even}', pair.lesson[1].room ? (pair.lesson[1].room + ' ' + pair.lesson[1].building): '');
        }

        dayLessons = dayLessons
          .replace('{subject}', subject)
          .replace('{room}', room);
      });
      dayBlocks[dayIndex].innerHTML = dayLessons;
    });
    console.log(schedule);
  }

  app.updateSchedule = function(newSchedule) {
    console.log('updateSchedule', newSchedule.version <= app.currentVersion);
    if(newSchedule.version <= app.currentVersion) {
      return;
    }
    app.currentVersion  = newSchedule.version;
    app.updateScheduleView(newSchedule);
  };

  function requestSchedule() {
    var url = '/schedule.json';

    if ('caches' in window) {
      caches.match(url).then(function(response) {
        if (response) {
          response.json().then(function(jsonResponse) {
            app.updateSchedule(jsonResponse);
          });
        }
      });
    }

    fetch(url, {mode: 'no-cors'})
      .then(function(response) {
        if(response) {
          response.json().then(function(jsonResponse) {
            app.updateSchedule(jsonResponse);
          });
        }
      })
      .catch(function() {
        console.log('Offline');
      });
  }

  requestSchedule();
  //window.requestInterval = setInterval(requestSchedule, 2000);
})();