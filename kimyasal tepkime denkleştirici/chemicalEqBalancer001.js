/*
 * Kimyasal denklemi dengeleyici (TypeScript'ten derlenmiş)
 *
 * Copyright (c) 2025 Project Nayuki
 * Tüm hakları saklıdır. Lisans için Nayuki ile iletişime geçin.
 * https://www.nayuki.io/page/chemical-equation-balancer-javascript
 */
"use strict";
/*---- HTML GUI'den giriş noktası fonksiyonları ----*/
const formulaElem = queryInput("#inputFormula");
// Verilen formül stringini dengeler ve HTML çıktısını sayfada ayarlar. Hiçbir şey döndürmez.
function doBalance() {
    // Çıktıyı temizle
    const msgElem = queryHtml("#message");
    const balancedElem = queryHtml("#balanced");
    const codeOutElem = queryHtml("#codeOutput");
    msgElem.textContent = "";
    while (balancedElem.firstChild !== null)
        balancedElem.removeChild(balancedElem.firstChild);
    while (codeOutElem.firstChild !== null)
        codeOutElem.removeChild(codeOutElem.firstChild);
    codeOutElem.textContent = " ";
    // Denklemi çöz
    const formulaStr = formulaElem.value;
    let eqn;
    try {
        eqn = new Parser(formulaStr).parseEquation();
    }
    catch (e) {
        if (e instanceof ParseError) { // Başlangıç ve mümkünse bitiş karakter indekslerine sahip hata mesajı nesnesi
            msgElem.textContent = "Sözdizimi hatası: " + e.message;
            const start = e.start;
            let end = e.end !== undefined ? e.end : e.start;
            while (end > start && [" ", "\t"].includes(formulaStr.charAt(end - 1)))
                end--; // Boşlukları ortadan kaldırmak için pozisyonu ayarla
            if (start == end)
                end++;
            codeOutElem.textContent = formulaStr.substring(0, start);
            if (end <= formulaStr.length) {
                codeOutElem.append(createElem("u", formulaStr.substring(start, end)));
                codeOutElem.append(formulaStr.substring(end, formulaStr.length));
            }
            else
                codeOutElem.append(createElem("u", " "));
        }
        else if (e instanceof Error) { // Basit hata mesajı dizesi
            msgElem.textContent = "Sözdizimi hatası: " + e.message;
        }
        else {
            msgElem.textContent = "Doğrulama hatası";
        }
        return;
    }
    try {
        let matrix = buildMatrix(eqn); // Matris oluştur
        solve(matrix); // Doğrusal sistemi çöz
        const coefs = extractCoefficients(matrix); // Katsayıları al
        checkAnswer(eqn, coefs); // Kendi kendini test et, başarısız olmamalı
        balancedElem.append(eqn.toHtml(coefs)); // Dengelenmiş denklemi görüntüle
    }
    catch (e) {
        assertIsError(e);
        msgElem.textContent = e.message;
    }
}
// Giriş kutusunu verilen formül dizesiyle ayarlar ve denklemi dengeler. Hiçbir şey döndürmez.
function doDemo(formulaStr) {
    formulaElem.value = formulaStr;
    doBalance();
}
const RANDOM_DEMOS = [
    "H2 + O2 = H2O",
    "Fe + O2 = Fe2O3",
    "NH3 + O2 = N2 + H2O",
    "C2H2 + O2 = CO2 + H2O",
    "C3H8O + O2 = CO2 + H2O",
    "Na + O2 = Na2O",
    "P4 + O2 = P2O5",
    "Na2O + H2O = NaOH",
    "Mg + HCl = MgCl2 + H2",
    "AgNO3 + LiOH = AgOH + LiNO3",
    "Pb + PbO2 + H^+ + SO4^2- = PbSO4 + H2O",
    "HNO3 + Cu = Cu(NO3)2 + H2O + NO",
    "KNO2 + KNO3 + Cr2O3 = K2CrO4 + NO",
    "AgNO3 + BaCl2 = Ba(NO3)2 + AgCl",
    "Cu(NO3)2 = CuO + NO2 + O2",
    "Al + CuSO4 = Al2(SO4)3 + Cu",
    "Na3PO4 + Zn(NO3)2 = NaNO3 + Zn3(PO4)2",
    "Cl2 + Ca(OH)2 = Ca(ClO)2 + CaCl2 + H2O",
    "CHCl3 + O2 = CO2 + H2O + Cl2",
    "H2C2O4 + MnO4^- = H2O + CO2 + MnO + OH^-",
    "H2O2 + Cr2O7^2- = Cr^3+ + O2 + OH^-",
    "KBr + KMnO4 + H2SO4 = Br2 + MnSO4 + K2SO4 + H2O",
    "K2Cr2O7 + KI + H2SO4 = Cr2(SO4)3 + I2 + H2O + K2SO4",
    "KClO3 + KBr + HCl = KCl + Br2 + H2O",
    "Ag + HNO3 = AgNO3 + NO + H2O",
    "P4 + OH^- + H2O = H2PO2^- + P2H4",
    "Zn + NO3^- + H^+ = Zn^2+ + NH4^+ + H2O",
    "ICl + H2O = Cl^- + IO3^- + I2 + H^+",
    "AB2 + AC3 + AD5 + AE7 + AF11 + AG13 + AH17 + AI19 + AJ23 = A + ABCDEFGHIJ",
];
let lastRandomIndex = -1;
function doRandom() {
    let index;
    do {
        index = Math.floor(Math.random() * RANDOM_DEMOS.length);
        index = Math.max(Math.min(index, RANDOM_DEMOS.length - 1), 0);
    } while (RANDOM_DEMOS.length >= 2 && index == lastRandomIndex);
    lastRandomIndex = index;
    doDemo(RANDOM_DEMOS[index]);
}
/*---- Metin formülü ayrıştırıcı sınıflar ----*/
class Parser {
    constructor(formulaStr) {
        this.tok = new Tokenizer(formulaStr);
    }
    // Denklemi ayrıştırır ve döndürür.
    parseEquation() {
        let lhs = [this.parseTerm()];
        while (true) {
            const next = this.tok.peek();
            if (next == "+") {
                this.tok.consume(next);
                lhs.push(this.parseTerm());
            }
            else if (next == "=") {
                this.tok.consume(next);
                break;
            }
            else
                throw new ParseError("Artı veya eşittir işareti bekleniyor", this.tok.pos);
        }
        let rhs = [this.parseTerm()];
        while (true) {
            const next = this.tok.peek();
            if (next === null)
                break;
            else if (next == "+") {
                this.tok.consume(next);
                rhs.push(this.parseTerm());
            }
            else
                throw new ParseError("Artı veya son bekleniyor", this.tok.pos);
        }
        return new Equation(lhs, rhs);
    }
    // Bir terimi ayrıştırır ve döndürür.
    parseTerm() {
        const startPos = this.tok.pos;
        // Grupları ve elementleri ayrıştır
        let items = [];
        let electron = false;
        let next;
        while (true) {
            next = this.tok.peek();
            if (next == "(")
                items.push(this.parseGroup());
            else if (next == "e") {
                this.tok.consume(next);
                electron = true;
            }
            else if (next !== null && /^[A-Z][a-z]*$/.test(next))
                items.push(this.parseElement());
            else if (next !== null && /^[0-9]+$/.test(next))
                throw new ParseError("Geçersiz terim - sayı beklenmiyor", this.tok.pos);
            else
                break;
        }
        // İsteğe bağlı yükü ayrıştır
        let charge = null;
        if (next == "^") {
            this.tok.consume(next);
            next = this.tok.peek();
            if (next === null)
                throw new ParseError("Sayı veya işaret bekleniyor", this.tok.pos);
            else {
                charge = this.parseOptionalNumber();
                next = this.tok.peek();
            }
            if (next == "+")
                charge = +charge; // İşlem yok
            else if (next == "-")
                charge = -charge;
            else
                throw new ParseError("İşaret bekleniyor", this.tok.pos);
            this.tok.take(); // İşareti tüket
        }
        // Terimi kontrol et ve sonrası için işlem yap
        if (electron) {
            if (items.length > 0)
                throw new ParseError("Geçersiz terim - elektron yalnız başına olmalı", startPos, this.tok.pos);
            if (charge === null) // Yükün atlanmasına izin ver
                charge = -1;
            if (charge != -1)
                throw new ParseError("Geçersiz terim - elektron için geçersiz yük", startPos, this.tok.pos);
        }
        else {
            if (items.length == 0)
                throw new ParseError("Geçersiz terim - boş", startPos, this.tok.pos);
            if (charge === null)
                charge = 0;
        }
        return new Term(items, charge);
    }
    // Bir grubu ayrıştırır ve döndürür.
    parseGroup() {
        const startPos = this.tok.pos;
        this.tok.consume("(");
        let items = [];
        while (true) {
            const next = this.tok.peek();
            if (next == "(")
                items.push(this.parseGroup());
            else if (next !== null && /^[A-Z][a-z]*$/.test(next))
                items.push(this.parseElement());
            else if (next == ")") {
                this.tok.consume(next);
                if (items.length == 0)
                    throw new ParseError("Boş grup", startPos, this.tok.pos);
                break;
            }
            else
                throw new ParseError("Element, grup veya kapanış parantezi bekleniyor", this.tok.pos);
        }
        return new Group(items, this.parseOptionalNumber());
    }

    // Bir elementi ayrıştırır ve döndürür.
    parseElement() {
        const name = this.tok.take();
        if (!/^[A-Z][a-z]*$/.test(name))
            throw new Error("Assertion error");
        return new ChemElem(name, this.parseOptionalNumber());
    }
    // Eğer bir sayı varsa, bir sayıyı ayrıştırır ve döndürür, 1 varsayılan olarak kabul edilir.
    parseOptionalNumber() {
        const next = this.tok.peek();
        if (next !== null && /^[0-9]+$/.test(next))
            return checkedParseInt(this.tok.take());
        else
            return 1;
    }
}
// Bir formülü token dizisine ayıran sınıf.
class Tokenizer {
    constructor(str) {
        this.str = str.replace(/\u2212/g, "-");
        this.pos = 0;
        this.skipSpaces();
    }
    // Sonraki token'ı bir string olarak döndürür, eğer token akışı sona erdiyse null döner.
    peek() {
        if (this.pos == this.str.length) // Akışın sonu
            return null;
        const match = /^([A-Za-z][a-z]*|[0-9]+|[+\-^=()])/.exec(this.str.substring(this.pos));
        if (match === null)
            throw new ParseError("Geçersiz sembol", this.pos);
        return match[0];
    }
    // Sonraki token'ı bir string olarak döndürür ve tokenizer'ı token'ın sonrasına ilerletir.
    take() {
        const result = this.peek();
        if (result === null)
            throw new Error("Sonraki token'a ilerleniyor");
        this.pos += result.length;
        this.skipSpaces();
        return result;
    }
    // Sonraki token'ı alır ve verilen string ile eşleşip eşleşmediğini kontrol eder, eşleşmiyorsa bir istisna fırlatır.
    consume(s) {
        if (this.take() != s)
            throw new Error("Token uyuşmazlığı");
    }
    skipSpaces() {
        const match = /^[ \t]*/.exec(this.str.substring(this.pos));
        if (match === null)
            throw new Error("Assertion error");
        this.pos += match[0].length;
    }
}
class ParseError extends Error {
    constructor(message, start, end) {
        super(message);
        this.start = start;
        this.end = end;
        Object.setPrototypeOf(this, ParseError.prototype); // ECMAScript 5 uyumluluğu
    }
}
/*---- Kimyasal denklem veri türleri ----*/
// Tam bir kimyasal denklem. Bir sol taraf (lhs) ve bir sağ taraf (rhs) terim listesi vardır.
// Örnek: H2 + O2 -> H2O.
class Equation {
    constructor(lhs, rhs) {
        // Savunma kopyaları oluştur
        this.leftSide = lhs.slice();
        this.rightSide = rhs.slice();
    }
    // Bu denklemde kullanılan tüm elementlerin adlarını içeren bir dizi döndürür.
    // Dizi bir küme olduğu için, öğeler rastgele bir sıradadır ve hiçbir öğe tekrarlanmaz.
    getElements() {
        const result = new Set();
        for (const item of this.leftSide.concat(this.rightSide))
            item.getElements(result);
        return Array.from(result);
    }
    // Bu denklemi temsil eden bir HTML elementi döndürür.
    // 'coefs' isteğe bağlı bir argümandır, bu terimlerle eşleşen bir katsayılar dizisidir.
    toHtml(coefs) {
        if (coefs !== undefined && coefs.length != this.leftSide.length + this.rightSide.length)
            throw new RangeError("Katsayı sayısı uyuşmazlığı");
        let node = document.createDocumentFragment();
        let j = 0;
        function termsToHtml(terms) {
            let head = true;
            for (const term of terms) {
                const coef = coefs !== undefined ? coefs[j] : 1;
                if (coef != 0) {
                    if (head)
                        head = false;
                    else
                        node.append(createSpan("plus", " + "));
                    if (coef != 1) {
                        let span = createSpan("coefficient", coef.toString().replace(/-/, MINUS));
                        if (coef < 0)
                            span.classList.add("negative");
                        node.append(span);
                    }
                    node.append(term.toHtml());
                }
                j++;
            }
        }
        termsToHtml(this.leftSide);
        node.append(createSpan("rightarrow", " \u2192 "));
        termsToHtml(this.rightSide);
        return node;
    }
}
// Kimyasal bir denklemin terimi. Bir grup veya element listesine ve bir yüke sahiptir.
// Örnek: H3O^+, veya e^-.
class Term {
    constructor(items, charge) {
        if (items.length == 0 && charge != -1)
            throw new RangeError("Geçersiz terim"); // Elektron durumu
        this.items = items.slice();
        this.charge = charge;
    }
    getElements(resultSet) {
        resultSet.add("e");
        for (const item of this.items)
            item.getElements(resultSet);
    }
    // Bu terimde verilen elementin (bir string olarak belirtilen) kaç kez geçtiğini sayar, grupları ve sayıları dikkate alır, bir tamsayı döndürür.
    countElement(name) {
        if (name == "e") {
            return -this.charge;
        }
        else {
            let sum = 0;
            for (const item of this.items)
                sum = checkedAdd(sum, item.countElement(name));
            return sum;
        }
    }
    // Bu terimi temsil eden bir HTML elementi döndürür.
    toHtml() {
        let node = createSpan("term");
        if (this.items.length == 0 && this.charge == -1) {
            node.textContent = "e";
            node.append(createElem("sup", MINUS));
        }
        else {
            for (const item of this.items)
                node.append(item.toHtml());
            if (this.charge != 0) {
                let s;
                if (Math.abs(this.charge) == 1)
                    s = "";
                else
                    s = Math.abs(this.charge).toString();
                if (this.charge > 0)
                    s += "+";
                else
                    s += MINUS;
                node.append(createElem("sup", s));
            }
        }
        return node;
    }
}
// Bir terimdeki bir grup. Bir grup veya öğe listesine sahiptir.
// Örneğin: (OH)3
class Group {
    constructor(items, count) {
        if (count < 1)
            throw new RangeError("Doğrulama hatası: Sayı pozitif bir tam sayı olmalıdır");
        this.items = items.slice();
        this.count = count;
    }
    getElements(resultSet) {
        for (const item of this.items)
            item.getElements(resultSet);
    }
    countElement(name) {
        let sum = 0;
        for (const item of this.items)
            sum = checkedAdd(sum, checkedMultiply(item.countElement(name), this.count));
        return sum;
    }
    // Bu grubun HTML öğesini döndürür.
    toHtml() {
        let node = createSpan("group", "(");
        for (const item of this.items)
            node.append(item.toHtml());
        node.append(")");
        if (this.count != 1)
            node.append(createElem("sub", this.count.toString()));
        return node;
    }
}
// Bir kimyasal element.
// Örneğin: Na, F2, Ace, Uuq6
class ChemElem {
    constructor(name, count) {
        this.name = name;
        this.count = count;
        if (count < 1)
            throw new RangeError("Doğrulama hatası: Sayı pozitif bir tam sayı olmalıdır");
    }
    getElements(resultSet) {
        resultSet.add(this.name);
    }
    countElement(n) {
        return n == this.name ? this.count : 0;
    }
    // Bu elementin HTML öğesini döndürür.
    toHtml() {
        let node = createSpan("element", this.name);
        if (this.count != 1)
            node.append(createElem("sub", this.count.toString()));
        return node;
    }
}
/*---- Temel sayı işleme fonksiyonları ----*/
// Bir tamsayılar matrisi.
class Matrix {
    constructor(numRows, numCols) {
        this.numRows = numRows;
        this.numCols = numCols;
        if (numRows < 0 || numCols < 0)
            throw new RangeError("Geçersiz argüman");
        // Sıfırlarla başlat
        let row = [];
        for (let j = 0; j < numCols; j++)
            row.push(0);
        this.cells = []; // Ana veri (matris)
        for (let i = 0; i < numRows; i++)
            this.cells.push(row.slice());
    }
    /* Erişim fonksiyonları */
    // Verilen hücrenin değerini döndürür, burada r satır ve c sütun.
    get(r, c) {
        if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
            throw new RangeError("İndeks sınırları dışında");
        return this.cells[r][c];
    }
    // Verilen hücreyi verilen değere ayarlar, burada r satır ve c sütun.
    set(r, c, val) {
        if (r < 0 || r >= this.numRows || c < 0 || c >= this.numCols)
            throw new RangeError("İndeks sınırları dışında");
        this.cells[r][c] = val;
    }
    /* Gauss-Jordan Eliminasyonu için özel yardımcı fonksiyonlar */
    // Verilen indekslerdeki iki satırı değiştirir. i == j durumu kabul edilir.
    swapRows(i, j) {
        if (i < 0 || i >= this.numRows || j < 0 || j >= this.numRows)
            throw new RangeError("İndeks sınırları dışında");
        const temp = this.cells[i];
        this.cells[i] = this.cells[j];
        this.cells[j] = temp;
    }
    // Verilen iki satırın toplamını döndürür. Satırlar indeks değildir.
// Örneğin, addRow([3, 1, 4], [1, 5, 6]) = [4, 6, 10].
    static addRows(x, y) {
        let z = [];
        for (let i = 0; i < x.length; i++)
            z.push(checkedAdd(x[i], y[i]));
        return z;
    }
    // Verilen satırın bir skalarla çarpılmasından elde edilen yeni satırı döndürür. Satır, indeks değildir.
// Örneğin, multiplyRow([0, 1, 3], 4) = [0, 4, 12].
    static multiplyRow(x, c) {
        return x.map(val => checkedMultiply(val, c));
    }
    // Verilen satırdaki tüm sayıların EBOB'unu döndürür. Satır, indeks değildir.
// Örneğin, gcdRow([3, 6, 9, 12]) = 3.
    static gcdRow(x) {
        let result = 0;
        for (const val of x)
            result = gcd(val, result);
        return result;
    }
    // Satırdaki ilk sıfır olmayan sayının (varsa) işaretini pozitif yapar ve satırın EBOB'unun 0 veya 1 olmasını sağlar.
// Örneğin, simplifyRow([0, -2, 2, 4]) = [0, 1, -1, -2].
    static simplifyRow(x) {
        let sign = 0;
        for (const val of x) {
            if (val != 0) {
                sign = Math.sign(val);
                break;
            }
        }
        if (sign == 0)
            return x.slice();
        const g = Matrix.gcdRow(x) * sign;
        return x.map(val => val / g);
    }
    // Bu matrisi sadeleştirilmiş satır echelona (RREF) dönüştürür, ancak her önde gelen katsayının 1 olması gerekmez. Her satır sadeleştirilir.
    gaussJordanEliminate() {
        // Tüm satırları sadeleştir
        let cells = this.cells = this.cells.map(Matrix.simplifyRow);
        // Satır echelona formunu (REF) hesapla
        let numPivots = 0;
        for (let i = 0; i < this.numCols; i++) {
            // Pivotu bul
            let pivotRow = numPivots;
            while (pivotRow < this.numRows && cells[pivotRow][i] == 0)
                pivotRow++;
            if (pivotRow == this.numRows)
                continue;
            const pivot = cells[pivotRow][i];
            this.swapRows(numPivots, pivotRow);
            numPivots++;
            // Altını sıfırla
            for (let j = numPivots; j < this.numRows; j++) {
                const g = gcd(pivot, cells[j][i]);
                cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][i] / g)));
            }
        }
        // Azaltılmış satır echelon formunu (RREF) hesapla, ancak önde gelen katsayının 1 olması gerekmez
        for (let i = this.numRows - 1; i >= 0; i--) {
            // Pivotu bul
            let pivotCol = 0;
            while (pivotCol < this.numCols && cells[i][pivotCol] == 0)
                pivotCol++;
            if (pivotCol == this.numCols)
                continue;
            const pivot = cells[i][pivotCol];
            // Üstünü sıfırla
            for (let j = i - 1; j >= 0; j--) {
                const g = gcd(pivot, cells[j][pivotCol]);
                cells[j] = Matrix.simplifyRow(Matrix.addRows(Matrix.multiplyRow(cells[j], pivot / g), Matrix.multiplyRow(cells[i], -cells[j][pivotCol] / g)));
            }
        }
    }
}
// Verilen denklem nesnesine dayalı bir matris döndürür.
function buildMatrix(eqn) {
    let elems = eqn.getElements();
    let lhs = eqn.leftSide;
    let rhs = eqn.rightSide;
    let matrix = new Matrix(elems.length + 1, lhs.length + rhs.length + 1);
    elems.forEach((elem, i) => {
        let j = 0;
        for (const term of lhs) {
            matrix.set(i, j, term.countElement(elem));
            j++;
        }
        for (const term of rhs) {
            matrix.set(i, j, -term.countElement(elem));
            j++;
        }
    });
    return matrix;
}
function solve(matrix) {
    matrix.gaussJordanEliminate();
    function countNonzeroCoeffs(row) {
        let count = 0;
        for (let i = 0; i < matrix.numCols; i++) {
            if (matrix.get(row, i) != 0)
                count++;
        }
        return count;
    }
    // Birden fazla sıfır olmayan katsayıya sahip satır bulun
    let i;
    for (i = 0; i < matrix.numRows - 1; i++) {
        if (countNonzeroCoeffs(i) > 1)
            break;
    }
    if (i == matrix.numRows - 1)
        throw new RangeError("Tüm sıfır çözümü"); // Sadece sıfır katsayıları olan benzersiz çözüm
    // Dışsal bir denklem ekle
    matrix.set(matrix.numRows - 1, i, 1);
    matrix.set(matrix.numRows - 1, matrix.numCols - 1, 1);
    matrix.gaussJordanEliminate();
}
function extractCoefficients(matrix) {
    const rows = matrix.numRows;
    const cols = matrix.numCols;
    if (cols - 1 > rows || matrix.get(cols - 2, cols - 2) == 0)
        throw new RangeError("Birden fazla bağımsız çözüm");
    let lcm = 1;
    for (let i = 0; i < cols - 1; i++)
        lcm = checkedMultiply(lcm / gcd(lcm, matrix.get(i, i)), matrix.get(i, i));
    let coefs = [];
    for (let i = 0; i < cols - 1; i++)
        coefs.push(checkedMultiply(lcm / matrix.get(i, i), matrix.get(i, cols - 1)));
    if (coefs.every(x => x == 0))
        throw new RangeError("Doğrulama hatası: Tüm sıfır çözümü");
    return coefs;
}
// Bir sorun varsa istisna fırlatır, aksi takdirde sessizce döner.
function checkAnswer(eqn, coefs) {
    if (coefs.length != eqn.leftSide.length + eqn.rightSide.length)
        throw new Error("Doğrulama hatası: Uzunluk uyuşmazlığı");
    function isZero(x) {
        if (typeof x != "number" || isNaN(x) || Math.floor(x) != x)
            throw new Error("Doğrulama hatası: Tam sayı değil");
        return x == 0;
    }
    if (coefs.every(isZero))
        throw new Error("Doğrulama hatası: Tüm sıfır çözümü");
    for (const elem of eqn.getElements()) {
        let sum = 0;
        let j = 0;
        for (const term of eqn.leftSide) {
            sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), coefs[j]));
            j++;
        }
        for (const term of eqn.rightSide) {
            sum = checkedAdd(sum, checkedMultiply(term.countElement(elem), -coefs[j]));
            j++;
        }
        if (sum != 0)
            throw new Error("Doğrulama hatası: Yanlış denge");
    }
}
/*---- Basit matematiksel fonksiyonlar ----*/
const INT_MAX = 9007199254740992; // 2^53
// Verilen dizgeyi bir sayıya dönüştürür, ya da sonuç çok büyükse bir istisna fırlatır.
function checkedParseInt(str) {
    const result = parseInt(str, 10);
    if (isNaN(result))
        throw new RangeError("Bir sayı değil");
    return checkOverflow(result);
}
// Verilen tam sayıların toplamını döndürür, ya da sonuç çok büyükse bir istisna fırlatır.
function checkedAdd(x, y) {
    return checkOverflow(x + y);
}
// Verilen tam sayıların çarpımını döndürür, ya da sonuç çok büyükse bir istisna fırlatır.
function checkedMultiply(x, y) {
    return checkOverflow(x * y);
}
// Verilen tam sayının çok büyük olup olmadığını kontrol eder, aksi takdirde döndürür.
function checkOverflow(x) {
    if (Math.abs(x) >= INT_MAX)
        throw new RangeError("Aritmetik taşması");
    return x;
}
// Verilen tam sayıların en büyük ortak bölenini döndürür.
function gcd(x, y) {
    if (typeof x != "number" || typeof y != "number" || isNaN(x) || isNaN(y))
        throw new Error("Geçersiz argüman");
    x = Math.abs(x);
    y = Math.abs(y);
    while (y != 0) {
        const z = x % y;
        x = y;
        y = z;
    }
    return x;
}
/*---- Çeşitli kodlar ----*/
// Unicode karakter sabitleri (çünkü bu betik dosyasının karakter kodlaması belirtilmemiştir)
const MINUS = "\u2212"; // Eksi işareti
// Verilen etiket adıyla yeni bir DOM öğesi döndürür, isteğe bağlı olarak verilen metin içeriğiyle.
function createElem(tagName, text) {
    let result = document.createElement(tagName);
    if (text !== undefined)
        result.textContent = text;
    return result;
}
// Aşağıdaki gibi bir DOM düğümü döndürür: <span class="cls">text</span>
function createSpan(cls, text) {
    let result = createElem("span", text);
    result.classList.add(cls);
    return result;
}
