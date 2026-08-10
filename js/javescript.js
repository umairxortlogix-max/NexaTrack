const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
        document.body.classList.toggle('sidebar-open');
    });
}

if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeSidebar);
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) {
        closeSidebar();
    }
});


  $(function () {
      $('input[name="date"]').daterangepicker({
        timePicker: true,
        startDate: moment().startOf('month'),
        endDate: moment().endOf('month'),
        locale: { format: 'MM/DD/YYYY' }
      });
    });

    // ─── CLOCK STATE ─── (only if clock widget exists on page)
    const statusDot = document.getElementById('statusDot');
    const statusLabel = document.getElementById('statusLabel');
    const statusTimer = document.getElementById('statusTimer');
    const allToggleBtns = document.querySelectorAll('.clock-actions .toggle-btn');

    let clockState = null;
    if (statusDot) {
      clockState = {
        status: 'clocked-out',
        startTime: null,
        timerInterval: null,
        elapsedSeconds: 0
      };
    }

    const statusMap = {
      'clocked-out': { label: 'Clocked Out', dotClass: 'clocked-out', labelClass: 'clocked-out' },
      'clocked-in': { label: 'Clocked In', dotClass: 'clocked-in', labelClass: 'clocked-in' },
      'on-lunch': { label: 'On Lunch', dotClass: 'on-lunch', labelClass: 'on-lunch' }
    };

    function updateUI() {
      if (!clockState) return;
      const info = statusMap[clockState.status];
      statusDot.className = 'status-dot ' + info.dotClass;
      statusLabel.textContent = info.label;
      statusLabel.className = 'status-label ' + info.labelClass;

      const actionMap = {
        'clocked-out': null,
        'clocked-in': 'clockin',
        'on-lunch': 'startlunch'
      };
      let activeAction = actionMap[clockState.status];

      allToggleBtns.forEach(btn => {
        btn.classList.remove('active');
        if (activeAction && btn.dataset.action === activeAction) {
          btn.classList.add('active');
        }
      });

      if (clockState.status === 'clocked-out') {
        if (clockState.timerInterval) {
          clearInterval(clockState.timerInterval);
          clockState.timerInterval = null;
        }
        clockState.elapsedSeconds = 0;
        statusTimer.textContent = formatTime(clockState.elapsedSeconds);
      } else if (clockState.status === 'on-lunch') {
        if (clockState.timerInterval) {
          clearInterval(clockState.timerInterval);
          clockState.timerInterval = null;
        }
        statusTimer.textContent = formatTime(clockState.elapsedSeconds);
      } else if (clockState.status === 'clocked-in') {
        if (!clockState.timerInterval) {
          clockState.timerInterval = setInterval(() => {
            clockState.elapsedSeconds++;
            statusTimer.textContent = formatTime(clockState.elapsedSeconds);
          }, 1000);
        }
      }
    }

    function formatTime(sec) {
      const h = String(Math.floor(sec / 3600)).padStart(2, '0');
      const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
      const s = String(sec % 60).padStart(2, '0');
      return h + ':' + m + ':' + s;
    }

    // ─── HANDLE CLOCK ACTIONS ───
    function handleClockAction(action) {
      if (!clockState) return;
      if (action === 'clockin' && clockState.status !== 'clocked-out') return;
      if (action === 'startlunch' && clockState.status !== 'clocked-in') return;
      if (action === 'endlunch' && clockState.status !== 'on-lunch') return;
      if (action === 'clockout' && clockState.status === 'clocked-out') return;

      switch (action) {
        case 'clockin':
          clockState.status = 'clocked-in';
          clockState.elapsedSeconds = 0;
          break;
        case 'startlunch':
          clockState.status = 'on-lunch';
          break;
        case 'endlunch':
          clockState.status = 'clocked-in';
          break;
        case 'clockout':
          clockState.status = 'clocked-out';
          clockState.elapsedSeconds = 0;
          break;
        default:
          return;
      }

      const actionLabels = {
        'clockin': 'Clock In',
        'startlunch': 'Start Lunch',
        'endlunch': 'End Lunch',
        'clockout': 'Clock Out'
      };
      console.log('🔔 ' + actionLabels[action] + ' → Status: ' + clockState.status);

      updateUI();
    }

    // ─── INIT ───
    if (clockState) updateUI();

    // ─── CHART: Attendance Trend ───
    const providerCtx = document.getElementById('providerChart');
    if (providerCtx) {
      new Chart(providerCtx, {
        type: 'bar',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{
            label: 'Hours',
            data: [160, 152, 158, 165, 160],
            backgroundColor: '#0d9488',
            borderRadius: 6
          }, {
            label: 'Pay',
            data: [2880, 2736, 2844, 2970, 2880],
            backgroundColor: '#4338ca',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: { callbacks: { label: (c) => c.dataset.label + ': ' + c.parsed.y.toLocaleString() + (c.dataset.label === 'Hours' ? ' hrs' : '') } }
          },
          scales: {
            x: { grid: { display: false } },
            y: {
              beginAtZero: true,
              ticks: { callback: (value) => value.toLocaleString() }
            }
          }
        }
      });
    }

    // ─── MAKE handleClockAction GLOBAL ───
    window.handleClockAction = handleClockAction;