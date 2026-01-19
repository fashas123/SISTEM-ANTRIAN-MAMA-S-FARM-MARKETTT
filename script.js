document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi elemen
    const currentAntrianInput = document.getElementById('current-antrian');
    const decreaseAntrianBtn = document.getElementById('decrease-antrian');
    const increaseAntrianBtn = document.getElementById('increase-antrian');
    const resetAntrianBtn = document.getElementById('reset-antrian');
    const operatorSelect = document.getElementById('operator-select');
    const panggilAntrianBtn = document.getElementById('panggil-antrian');
    const ulangiPanggilanBtn = document.getElementById('ulangi-panggilan');
    const displayAntrian = document.getElementById('display-antrian');
    const displayOperatorText = document.getElementById('display-operator-text');
    const displayTime = document.getElementById('display-time');
    const historyList = document.getElementById('history-list');
    const operatorGrid = document.querySelector('.operator-grid');
    const currentDateElement = document.getElementById('current-date');
    const currentTimeElement = document.getElementById('current-time');
    const audioBell = document.getElementById('audio-bell');
    
    // Data antrian
    let nomorAntrian = 1;
    let operatorTujuan = "Operator 1 - Pendaftaran";
    let riwayatPanggilan = [];
    const maxHistory = 5;
    
    // Data operator
    const operators = [
        { id: 1, name: "Operator 1", description: "Pendaftaran", status: "Tersedia" },
        { id: 2, name: "Operator 2", description: "Dokumen", status: "Tersedia" },
        { id: 3, name: "Operator 3", description: "Wawancara", status: "Tersedia" },
        { id: 4, name: "Operator 4", description: "Psikotes", status: "Tersedia" },
        { id: 5, name: "Operator 5", description: "Kesehatan", status: "Tersedia" },
        { id: 6, name: "Operator 6", description: "Pembayaran", status: "Tersedia" },
        { id: 7, name: "Operator 7", description: "Pengumuman", status: "Tersedia" },
        { id: 8, name: "Operator 8", description: "Bantuan", status: "Tersedia" }
    ];
    
    // Fungsi untuk memperbarui tanggal dan waktu
    function updateDateTime() {
        const now = new Date();
        
        // Format tanggal: Hari, Tanggal Bulan Tahun
        const optionsDate = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('id-ID', optionsDate);
        
        // Format waktu: HH:MM:SS
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const formattedTime = `${hours}:${minutes}:${seconds}`;
        
        // Update elemen
        currentDateElement.textContent = formattedDate;
        currentTimeElement.textContent = formattedTime;
        
        // Return waktu lengkap untuk riwayat
        const optionsFull = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return now.toLocaleDateString('id-ID', optionsFull);
    }
    
    // Fungsi untuk format nomor antrian dengan 3 digit
    function formatAntrian(num) {
        return String(num).padStart(3, '0');
    }
    
    // Fungsi untuk memperbarui tampilan antrian
    function updateDisplay() {
        displayAntrian.textContent = formatAntrian(nomorAntrian);
        currentAntrianInput.value = nomorAntrian;
        displayOperatorText.textContent = operatorTujuan;
    }
    
    // Fungsi untuk menambahkan riwayat panggilan
    function addToHistory(antrian, operator, waktu) {
        const historyItem = {
            antrian: antrian,
            operator: operator,
            waktu: waktu.split(', ')[1] // Hanya ambil bagian waktu
        };
        
        riwayatPanggilan.unshift(historyItem);
        
        // Batasi riwayat hanya 5 item terakhir
        if (riwayatPanggilan.length > maxHistory) {
            riwayatPanggilan.pop();
        }
        
        updateHistoryDisplay();
    }
    
    // Fungsi untuk memperbarui tampilan riwayat
    function updateHistoryDisplay() {
        historyList.innerHTML = '';
        
        riwayatPanggilan.forEach(item => {
            const historyElement = document.createElement('div');
            historyElement.className = 'history-item';
            historyElement.innerHTML = `
                <div class="history-number">${formatAntrian(item.antrian)}</div>
                <div class="history-operator">${item.operator}</div>
                <div class="history-time">${item.waktu}</div>
            `;
            historyList.appendChild(historyElement);
        });
    }
    
    // Fungsi untuk membuat kartu operator
    function createOperatorCards() {
        operatorGrid.innerHTML = '';
        
        operators.forEach(operator => {
            const operatorCard = document.createElement('div');
            operatorCard.className = 'operator-card';
            operatorCard.dataset.id = operator.id;
            
            operatorCard.innerHTML = `
                <div class="operator-header">
                    <div class="operator-icon">
                        <i class="fas fa-user-tie"></i>
                    </div>
                    <div>
                        <div class="operator-name">${operator.name}</div>
                        <div class="operator-desc">${operator.description}</div>
                    </div>
                </div>
                <div class="operator-status">
                    <div class="status-label">Status:</div>
                    <div class="status-value">${operator.status}</div>
                </div>
            `;
            
            operatorGrid.appendChild(operatorCard);
        });
    }
    
    // Fungsi untuk memperbarui operator yang aktif
    function updateActiveOperator() {
        // Hapus kelas active dari semua operator
        document.querySelectorAll('.operator-card').forEach(card => {
            card.classList.remove('active');
        });
        
        // Tambahkan kelas active ke operator yang dipilih
        const selectedOperatorId = parseInt(operatorSelect.value);
        const selectedOperatorCard = document.querySelector(`.operator-card[data-id="${selectedOperatorId}"]`);
        if (selectedOperatorCard) {
            selectedOperatorCard.classList.add('active');
        }
    }
    
    // Fungsi untuk memainkan suara bel pengumuman
    function playBellSound() {
        if (audioBell) {
            audioBell.currentTime = 0; // Reset ke awal
            audioBell.play().catch(e => {
                console.log("Tidak bisa memutar suara bel:", e);
                // Fallback: buat suara bel sederhana dengan Web Audio API
                createFallbackBell();
            });
        } else {
            createFallbackBell();
        }
    }
    
    // Fungsi fallback untuk suara bel
    function createFallbackBell() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 880; // Frekuensi nada A5
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log("Web Audio API tidak tersedia");
        }
    }
    
    // Fungsi untuk membuat suara panggilan menggunakan Web Speech API dengan bahasa Indonesia
    function buatSuaraPanggilan(antrian, operator) {
        // Hentikan suara yang sedang diputar jika ada
        window.speechSynthesis.cancel();
        
        const suara = new SpeechSynthesisUtterance();
        
        // Format teks untuk diucapkan dalam bahasa Indonesia
        const nomorArray = antrian.split('');
        const nomorDibaca = nomorArray.join(' ');
        
        // Tentukan nama operator yang lebih mudah diucapkan
        let operatorDibaca = operator;
        if (operator.includes("Operator 1")) operatorDibaca = "Operator satu, meja pendaftaran";
        else if (operator.includes("Operator 2")) operatorDibaca = "Operator dua, meja dokumen";
        else if (operator.includes("Operator 3")) operatorDibaca = "Operator tiga, meja wawancara";
        else if (operator.includes("Operator 4")) operatorDibaca = "Operator empat, meja psikotes";
        else if (operator.includes("Operator 5")) operatorDibaca = "Operator lima, meja kesehatan";
        else if (operator.includes("Operator 6")) operatorDibaca = "Operator enam, meja pembayaran";
        else if (operator.includes("Operator 7")) operatorDibaca = "Operator tujuh, meja pengumuman";
        else if (operator.includes("Operator 8")) operatorDibaca = "Operator delapan, meja bantuan";
        
        suara.text = `Perhatian! Nomor antrian ${nomorDibaca}, silahkan menuju ke ${operatorDibaca}`;
        suara.lang = 'id-ID';
        suara.rate = 0.85; // Kecepatan bicara sedikit lebih lambat untuk kejelasan
        suara.pitch = 1; // Tinggi nada
        suara.volume = 1; // Volume
        
        // Tunggu sampai suara tersedia
        setTimeout(() => {
            const voices = window.speechSynthesis.getVoices();
            
            // Cari suara wanita bahasa Indonesia
            let femaleIndonesianVoice = voices.find(voice => 
                voice.lang.includes('id') && 
                (voice.name.toLowerCase().includes('female') || 
                 voice.name.toLowerCase().includes('perempuan') ||
                 voice.name.toLowerCase().includes('wanita'))
            );
            
            // Jika tidak ditemukan suara wanita Indonesia, gunakan suara Indonesia apapun
            if (!femaleIndonesianVoice) {
                femaleIndonesianVoice = voices.find(voice => voice.lang.includes('id'));
            }
            
            // Jika masih tidak ditemukan, gunakan suara default
            if (femaleIndonesianVoice) {
                suara.voice = femaleIndonesianVoice;
            }
            
            // Putar suara
            window.speechSynthesis.speak(suara);
        }, 100);
        
        return suara;
    }
    
    // Fungsi untuk memanggil antrian dengan suara pengumuman bandara
    async function panggilAntrian() {
        const waktuPanggilan = updateDateTime();
        const operatorText = operatorSelect.options[operatorSelect.selectedIndex].text;
        
        // Perbarui tampilan
        displayTime.textContent = waktuPanggilan.split(', ')[1];
        displayOperatorText.textContent = operatorText;
        
        // Tambahkan ke riwayat
        addToHistory(nomorAntrian, operatorText, waktuPanggilan);
        
        // Tampilkan notifikasi
        showNotification(`📢 Antrian ${formatAntrian(nomorAntrian)} dipanggil menuju ${operatorText}`);
        
        // Perbarui operator aktif
        updateActiveOperator();
        
        // Mainkan suara bel pengumuman bandara terlebih dahulu
        playBellSound();
        
        // Tunggu 500ms sebelum memanggil suara wanita
        setTimeout(() => {
            // Buat dan putar suara panggilan wanita
            const suara = buatSuaraPanggilan(formatAntrian(nomorAntrian), operatorText);
            
            // Naikkan nomor antrian untuk panggilan berikutnya
            nomorAntrian++;
            updateDisplay();
        }, 500);
    }
    
    // Fungsi untuk menampilkan notifikasi
    function showNotification(message) {
        // Hapus notifikasi sebelumnya jika ada
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Buat elemen notifikasi
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `<i class="fas fa-bullhorn"></