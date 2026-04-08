// ============================================
// SQL Injection Lab - 클라이언트 사이드 SQLite 실습
// ============================================

let db = null;
const completed = { lab1: false, lab2: false, lab3: false };

// === DB 초기화 ===
async function initDB() {
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
    });

    db = new SQL.Database();

    // 사용자 테이블
    db.run(`
        CREATE TABLE users (
            id INTEGER PRIMARY KEY,
            username TEXT,
            password TEXT,
            role TEXT
        )
    `);
    db.run(`INSERT INTO users VALUES (1, 'admin', 'sup3r_s3cret!', 'administrator')`);
    db.run(`INSERT INTO users VALUES (2, 'user1', 'password123', 'user')`);
    db.run(`INSERT INTO users VALUES (3, 'user2', 'qwerty456', 'user')`);
    db.run(`INSERT INTO users VALUES (4, 'guest', 'guest', 'guest')`);

    // 상품 테이블
    db.run(`
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            name TEXT,
            price TEXT
        )
    `);
    db.run(`INSERT INTO products VALUES (1, '노트북 Pro 15', '1,500,000원')`);
    db.run(`INSERT INTO products VALUES (2, '무선 마우스', '35,000원')`);
    db.run(`INSERT INTO products VALUES (3, '기계식 키보드', '89,000원')`);
    db.run(`INSERT INTO products VALUES (4, 'USB 허브 4포트', '15,000원')`);
    db.run(`INSERT INTO products VALUES (5, '모니터 27인치', '350,000원')`);

    // 비밀 테이블 (실습 3용)
    db.run(`
        CREATE TABLE secret_data (
            id INTEGER PRIMARY KEY,
            title TEXT,
            content TEXT
        )
    `);
    db.run(`INSERT INTO secret_data VALUES (1, 'DB 관리자 계정', 'root / r00t_p@ss!')`);
    db.run(`INSERT INTO secret_data VALUES (2, 'API 키', 'sk-ABC123XYZ789')`);
    db.run(`INSERT INTO secret_data VALUES (3, '서버 IP', '192.168.1.100 (내부망)')`);

    console.log('DB 초기화 완료');
}

// === 네비게이션 ===
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    document.getElementById(sectionId).classList.add('active');
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) navLink.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

// === 진행률 업데이트 ===
function updateProgress() {
    const count = Object.values(completed).filter(Boolean).length;
    const pct = (count / 3) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressText').textContent = `${count} / 3 완료`;
}

// === 힌트 시스템 ===
function showHint(lab, level) {
    const el = document.getElementById(`${lab}-hint-${level}`);
    if (el) el.classList.toggle('hidden');
}

// === 실시간 SQL 표시 ===
function updateSqlDisplay(elementId, sql) {
    document.getElementById(elementId).innerHTML = `<code>${escapeHtml(sql)}</code>`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 실습 1: 로그인 우회
// ============================================
function executeLab1() {
    const username = document.getElementById('lab1-username').value;
    const password = document.getElementById('lab1-password').value;

    // 취약한 쿼리 구성 (의도적)
    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    updateSqlDisplay('lab1-sql', sql);

    try {
        const result = db.exec(sql);
        const resultArea = document.getElementById('lab1-result');

        if (result.length > 0 && result[0].values.length > 0) {
            const user = result[0].values[0];
            const isAdmin = user[1] === 'admin' || (result[0].values.some(r => r[1] === 'admin'));

            if (isAdmin && (username.includes("'") || username.includes('"') || username.includes('OR') || username.includes('or'))) {
                completed.lab1 = true;
                updateProgress();
                resultArea.innerHTML = `
                    <div class="result-success">
                        <h3>SQL Injection 성공!</h3>
                        <p>로그인된 사용자: <strong>${escapeHtml(user[1])}</strong> (${escapeHtml(user[3])})</p>
                        <p>비밀번호를 몰라도 로그인에 성공했습니다.</p>
                        <p style="margin-top:12px; color: var(--text-secondary);">
                            <strong>원리:</strong> 입력값에 포함된 <code>'</code>가 SQL 문자열을 종료시키고,
                            <code>--</code>가 나머지를 주석 처리하여 비밀번호 검증을 우회했습니다.
                        </p>
                    </div>
                `;
            } else {
                resultArea.innerHTML = `
                    <div class="result-success">
                        <h3>로그인 성공</h3>
                        <p>사용자: <strong>${escapeHtml(user[1])}</strong></p>
                        <p style="color: var(--text-secondary);">정상적인 로그인입니다. SQL Injection을 시도해보세요!</p>
                    </div>
                `;
            }
        } else {
            resultArea.innerHTML = `
                <div class="result-fail">
                    <p>로그인 실패: 일치하는 사용자가 없습니다.</p>
                </div>
            `;
        }
    } catch (e) {
        document.getElementById('lab1-result').innerHTML = `
            <div class="result-error">
                <p><strong>SQL 오류:</strong> ${escapeHtml(e.message)}</p>
                <p style="margin-top:8px;">SQL 구문이 잘못되었습니다. 다시 시도해보세요.</p>
            </div>
        `;
    }
}

// 실시간 SQL 미리보기
['lab1-username', 'lab1-password'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        const u = document.getElementById('lab1-username').value;
        const p = document.getElementById('lab1-password').value;
        updateSqlDisplay('lab1-sql',
            `SELECT * FROM users WHERE username = '${u}' AND password = '${p}'`
        );
    });

    document.getElementById(id).addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeLab1();
    });
});

function resetLab1() {
    document.getElementById('lab1-username').value = '';
    document.getElementById('lab1-password').value = '';
    document.getElementById('lab1-result').innerHTML = '';
    updateSqlDisplay('lab1-sql', '입력을 기다리는 중...');
}

// ============================================
// 실습 2: UNION Injection
// ============================================
function executeLab2() {
    const search = document.getElementById('lab2-search').value;
    const sql = `SELECT name, price FROM products WHERE name LIKE '%${search}%'`;
    updateSqlDisplay('lab2-sql', sql);

    try {
        const result = db.exec(sql);
        const tbody = document.getElementById('lab2-tbody');
        tbody.innerHTML = '';

        if (result.length > 0 && result[0].values.length > 0) {
            const productNames = ['노트북 Pro 15', '무선 마우스', '기계식 키보드', 'USB 허브 4포트', '모니터 27인치'];
            let hasLeakedData = false;

            result[0].values.forEach(row => {
                const tr = document.createElement('tr');
                const isProduct = productNames.includes(row[0]);

                if (!isProduct) {
                    tr.classList.add('leaked');
                    hasLeakedData = true;
                }

                tr.innerHTML = `<td>${escapeHtml(String(row[0]))}</td><td>${escapeHtml(String(row[1]))}</td>`;
                tbody.appendChild(tr);
            });

            if (hasLeakedData && search.toLowerCase().includes('union')) {
                completed.lab2 = true;
                updateProgress();

                const successDiv = document.createElement('div');
                successDiv.className = 'result-success';
                successDiv.style.marginTop = '12px';
                successDiv.innerHTML = `
                    <h3>UNION Injection 성공!</h3>
                    <p>빨간색으로 표시된 행은 users 테이블에서 유출된 데이터입니다.</p>
                    <p style="margin-top:8px; color: var(--text-secondary);">
                        <strong>원리:</strong> UNION SELECT를 통해 원래 쿼리 결과에
                        다른 테이블의 데이터를 합쳐서 출력했습니다.
                    </p>
                `;
                document.getElementById('lab2-result').appendChild(successDiv);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">검색 결과가 없습니다.</td></tr>';
        }
    } catch (e) {
        document.getElementById('lab2-tbody').innerHTML = '';
        document.getElementById('lab2-result').innerHTML = `
            <table class="result-table" id="lab2-table">
                <thead><tr><th>상품명</th><th>가격</th></tr></thead>
                <tbody id="lab2-tbody"></tbody>
            </table>
            <div class="result-error">
                <p><strong>SQL 오류:</strong> ${escapeHtml(e.message)}</p>
            </div>
        `;
    }
}

document.getElementById('lab2-search').addEventListener('input', () => {
    const s = document.getElementById('lab2-search').value;
    updateSqlDisplay('lab2-sql',
        `SELECT name, price FROM products WHERE name LIKE '%${s}%'`
    );
});

document.getElementById('lab2-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeLab2();
});

function resetLab2() {
    document.getElementById('lab2-search').value = '';
    document.getElementById('lab2-tbody').innerHTML = '';
    document.getElementById('lab2-result').innerHTML = `
        <table class="result-table" id="lab2-table">
            <thead><tr><th>상품명</th><th>가격</th></tr></thead>
            <tbody id="lab2-tbody"></tbody>
        </table>
    `;
    updateSqlDisplay('lab2-sql', '입력을 기다리는 중...');
}

// ============================================
// 실습 3: DB 구조 탐색
// ============================================
function executeLab3() {
    const search = document.getElementById('lab3-search').value;
    const sql = `SELECT name, price FROM products WHERE name LIKE '%${search}%'`;
    updateSqlDisplay('lab3-sql', sql);

    try {
        const result = db.exec(sql);
        const tbody = document.getElementById('lab3-tbody');
        tbody.innerHTML = '';

        if (result.length > 0 && result[0].values.length > 0) {
            const productNames = ['노트북 Pro 15', '무선 마우스', '기계식 키보드', 'USB 허브 4포트', '모니터 27인치'];
            let hasSecretData = false;

            result[0].values.forEach(row => {
                const tr = document.createElement('tr');
                const isProduct = productNames.includes(row[0]);

                if (!isProduct) {
                    tr.classList.add('leaked');
                    if (String(row[0]).includes('secret') || String(row[1]).includes('secret') ||
                        String(row[0]).includes('API') || String(row[0]).includes('서버') || String(row[0]).includes('DB')) {
                        hasSecretData = true;
                    }
                }

                tr.innerHTML = `<td>${escapeHtml(String(row[0]))}</td><td>${escapeHtml(String(row[1]))}</td>`;
                tbody.appendChild(tr);
            });

            if (hasSecretData && search.toLowerCase().includes('union')) {
                completed.lab3 = true;
                updateProgress();

                const successDiv = document.createElement('div');
                successDiv.className = 'result-success';
                successDiv.style.marginTop = '12px';
                successDiv.innerHTML = `
                    <h3>DB 구조 탐색 성공!</h3>
                    <p>secret_data 테이블의 민감한 정보를 추출했습니다.</p>
                    <p style="margin-top:8px; color: var(--text-secondary);">
                        <strong>원리:</strong> sqlite_master를 통해 DB 구조를 파악한 뒤,
                        해당 테이블의 데이터를 UNION으로 추출했습니다.
                    </p>
                `;
                document.getElementById('lab3-result').appendChild(successDiv);
            } else if (!hasSecretData && search.toLowerCase().includes('sqlite_master')) {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'result-error';
                infoDiv.style.marginTop = '12px';
                infoDiv.innerHTML = `
                    <p>테이블 구조를 확인했습니다! 이제 <code>secret_data</code> 테이블의 내용을 추출해보세요.</p>
                `;
                document.getElementById('lab3-result').appendChild(infoDiv);
            }
        } else {
            tbody.innerHTML = '<tr><td colspan="2" style="text-align:center; color:var(--text-secondary);">검색 결과가 없습니다.</td></tr>';
        }
    } catch (e) {
        document.getElementById('lab3-tbody').innerHTML = '';
        document.getElementById('lab3-result').innerHTML = `
            <table class="result-table" id="lab3-table">
                <thead><tr><th>상품명</th><th>가격</th></tr></thead>
                <tbody id="lab3-tbody"></tbody>
            </table>
            <div class="result-error">
                <p><strong>SQL 오류:</strong> ${escapeHtml(e.message)}</p>
            </div>
        `;
    }
}

document.getElementById('lab3-search').addEventListener('input', () => {
    const s = document.getElementById('lab3-search').value;
    updateSqlDisplay('lab3-sql',
        `SELECT name, price FROM products WHERE name LIKE '%${s}%'`
    );
});

document.getElementById('lab3-search').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') executeLab3();
});

function resetLab3() {
    document.getElementById('lab3-search').value = '';
    document.getElementById('lab3-tbody').innerHTML = '';
    document.getElementById('lab3-result').innerHTML = `
        <table class="result-table" id="lab3-table">
            <thead><tr><th>상품명</th><th>가격</th></tr></thead>
            <tbody id="lab3-tbody"></tbody>
        </table>
    `;
    updateSqlDisplay('lab3-sql', '입력을 기다리는 중...');
}

// ============================================
// 방어 실습
// ============================================
function testVulnerable() {
    const username = document.getElementById('defense-vuln-user').value;
    const password = document.getElementById('defense-vuln-pass').value;

    const sql = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    updateSqlDisplay('defense-vuln-sql', sql);

    try {
        const result = db.exec(sql);
        const resultArea = document.getElementById('defense-vuln-result');

        if (result.length > 0 && result[0].values.length > 0) {
            const rows = result[0].values.map(r =>
                `<tr class="leaked"><td>${escapeHtml(String(r[1]))}</td><td>${escapeHtml(String(r[2]))}</td><td>${escapeHtml(String(r[3]))}</td></tr>`
            ).join('');
            resultArea.innerHTML = `
                <div class="result-fail" style="margin-top:8px;">
                    <p><strong>취약!</strong> ${result[0].values.length}개 행이 반환됨</p>
                    <table class="result-table" style="margin-top:8px;">
                        <thead><tr><th>username</th><th>password</th><th>role</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `;
        } else {
            resultArea.innerHTML = `<div class="result-success" style="margin-top:8px;"><p>결과 없음 (로그인 실패)</p></div>`;
        }
    } catch (e) {
        document.getElementById('defense-vuln-result').innerHTML = `
            <div class="result-error" style="margin-top:8px;"><p>SQL 오류: ${escapeHtml(e.message)}</p></div>
        `;
    }
}

function testSecure() {
    const username = document.getElementById('defense-safe-user').value;
    const password = document.getElementById('defense-safe-pass').value;

    const displaySql = `SELECT * FROM users WHERE username = ? AND password = ?\n-- 바인딩: [${escapeHtml(username)}, ${escapeHtml(password)}]`;
    updateSqlDisplay('defense-safe-sql', displaySql);

    try {
        const stmt = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        stmt.bind([username, password]);

        const results = [];
        while (stmt.step()) {
            results.push(stmt.getAsObject());
        }
        stmt.free();

        const resultArea = document.getElementById('defense-safe-result');

        if (results.length > 0) {
            resultArea.innerHTML = `
                <div class="result-success" style="margin-top:8px;">
                    <p><strong>정상 로그인:</strong> ${escapeHtml(results[0].username)} (${escapeHtml(results[0].role)})</p>
                    <p style="color:var(--text-secondary); margin-top:4px;">Parameterized Query로 안전하게 처리됨</p>
                </div>
            `;
        } else {
            resultArea.innerHTML = `
                <div class="result-success" style="margin-top:8px;">
                    <p>결과 없음 (로그인 실패)</p>
                    <p style="color:var(--text-secondary); margin-top:4px;">
                        SQL Injection 시도가 <strong>단순 문자열</strong>로 처리되어 공격이 무효화됩니다.
                    </p>
                </div>
            `;
        }
    } catch (e) {
        document.getElementById('defense-safe-result').innerHTML = `
            <div class="result-error" style="margin-top:8px;"><p>오류: ${escapeHtml(e.message)}</p></div>
        `;
    }
}

// === 초기화 ===
initDB().then(() => {
    console.log('SQL Injection Lab 준비 완료');
}).catch(err => {
    console.error('DB 초기화 실패:', err);
    document.querySelector('.container').innerHTML = `
        <div class="result-error" style="margin-top:80px;">
            <h2>초기화 오류</h2>
            <p>sql.js 로드에 실패했습니다. 인터넷 연결을 확인해주세요.</p>
            <p>${err.message}</p>
        </div>
    `;
});
