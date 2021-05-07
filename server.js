// Das Modul mysql wird in das Programm geladen. Es ist zuvor mit npm install mysql installiert worden.
// MySQL stellt Datenbankfunktionalität zur Verfügung. Datenbanken werden immer dann benötigt, wenn Daten
// außerhalb der Laufzeit des Programms verfügbar sein sollen.

const mysql = require('mysql')

// Klassendefinition der Klasse Konto. Die Klasse ist der Bauplan, der alle relevanten Eigenschaften enthält.
// Alle Objekte, die von dieser Klasse erzeugt werden, haben dieselben Eigenschaften, aber ggfs. unterschiedliche
// Eigenschaftswerte.

// Die Funktionalitäten des weather-Moduls werden der Konstanten weather zugewiesen.
const weather = require('weather-js');

// Klassendefinition (=Bauplan) der Klasse Konto.
// Von der Klasse werden Objekte der Klasse Konto erzeugt.
// Alle Objekte der Klasse Konto werden kleingeschrieben. 

class Konto{
    constructor(){
        // Eigenschaften: 
        this.IdKunde
        this.Kontonummer
        this.Kontoart
        this.Iban
    }
}

// Klassendefinition der Klasse Kunde. Die Klasse ist der Bauplan, von dem Kunden-Objekte erstellt werden.
// Alle Objekte vom Typ Kunde haben dieselben Eigenschaften. Die Eigenschaftswerte können unterschiedlich sein.

class Kunde {
    constructor(){
        this.IdKunde
        this.Kennwort
        this.Vorname
        this.Geburtsdatum
        this.Nachname
        this.Adresse
        this.Geschlecht        
        this.Mail
    }
}

// iban ist ein Modul, das wir uns in das Programm installiert haben: npm install iban
// Eine Konstante wird erstellt. Die Konstante heißt iban. Diese Konstante lebt während der ganzen Laufzeit des Programms, 
// weil sie auf der obersten Ebene des Programms deklariert wird.
// Das besondere am Typ const ist, dass ein Wert einmalig zugewiesen werden kann, danach aber nicht mehr verändert werden darf.
// Die Konstante iban ist ein Objekt, mit möglicherweise vielen Eigenschaften, Funtkionen usw.
// Objekte mit (möglicherweise) vielen verschiedenenen Eigenschaften nennt man komplexe Datentypen. 
// Demgegenüber sind einfache Zeichenketten (z.B. eine Id oder eine Schuhgröße) primitiv (=einwertig)
// iban stellt im Programm Funktionalitten zur Verfügung: 
// * Umwandlung der Kontonummer nach IBAN.
// * Validierung einer IBAN.

const iban = require('iban')

const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// Auf das mysql-Objekt wird eine Funktion namens createConnection() aufgerufen.
// Funktionen erkennt man an ()
// Funktionen machen etwas. Sie lassen sich also durch ein Verb beschreiben.
// Der Name von Funktionen enthält meistens ein Verb.
// Die Funktion createConnection nimmt alle Verbindungsparameter entgegen.

const dbVerbindung = mysql.createConnection({
    host: '130.255.124.99', // öffentliche IP-Adresse, unter der der Datenbankserver erreichbar ist.
    user: 'placematman',
    password: "BKB123456!",
    database: "dbn27" // Name der Datenbank. Diese Datenbank enthält dann alle unsere Tabellen.
})

// Der Connect zur Datenbank wird aufgebaut. 
// Die Schachtelung in Javascript muss sein, weil ansonsten die Anweisung .query('CREATE..) nicht
// darauf warten würde, dass die Verbindung zur Datenbank mit .connect() steht.

// Datentypen in MySQL:
// INT      :           Ganzzahl            :   1,2,3, ..., 100
// VARCHAR  :           Zeichenkette        :   ABc123!"§"
// CHAR     :           Zeichenkette, die mit Leerzeichen aufgefüllt wird.  : "    ABC"
// DECIMAL  :           Fließkommazahl      :   1234,124533
// TIMESTAMP:           Zeitstempel
// DATETIME

dbVerbindung.connect(function(fehler){
    dbVerbindung.query('CREATE TABLE kunde(idKunde INT(11), vorname VARCHAR(45), nachname VARCHAR(45), ort VARCHAR(45), kennwort VARCHAR(45), mail VARCHAR(45), PRIMARY KEY(idKunde));', function (fehler) {
        
        // if(fehler) ist gleichbedeutend mit if(fehler != undefined), das liegt daran:
        //  dass in Javascript instanziierte Objekte true sind.
        // Es kann also hier auf einen Vergleichopertator verzichtet werden.
        
        if (fehler) {
            if(fehler.code == "ER_TABLE_EXISTS_ERROR"){
                console.log("Tabelle kunde existiert bereits und wird nicht angelegt.")
            }else{
                console.log("Fehler: " + fehler )
            }
        }else{
            // Wenn das Fehlerobjekt undefined ist, also es keinen Fehler gibt, dann
            // wird der Rumpf von else ausgeführt:
            console.log("Tabelle Kunde erfolgreich angelegt.")
        }
    })
    // Die Verbindung zur Datenbank wird abgebaut:
})

dbVerbindung.connect(function(fehler){
    dbVerbindung.query('CREATE TABLE konto(iban VARCHAR(22), idKunde INT(11), kontoart VARCHAR(20), timestamp TIMESTAMP, PRIMARY KEY(iban));', function (fehler) {
        if (fehler) {
            if(fehler.code == "ER_TABLE_EXISTS_ERROR"){
                console.log("Tabelle konto existiert bereits und wird nicht angelegt.")
            }else{
                console.log("Fehler: " + fehler )
            }
        }else{
            console.log("Tabelle konto erfolgreich angelegt.")
        }
    })
})

// Eigenschaften einer Kontobewegung: iban  VARCHAR(22), betrag DECIMAL(15,2), verwendungszweck VARCHAR(378), timestamp TIMESTAMP 
// Ein neue Tabelle ist zu erstellen namens kontobewegung.
// Primary Key: iban, timestamp
// Foreign Key: iban     // Der FK verhindert, dass eine Kontobewegung zu einer fiktiven iban angelegt wird.   
                         // Durch die Foreign Key-Angabe wird verhindert, dass ein Konto gelöscht wird, zu dem es noch Kontobewegungen gibt.
// Fehler, die die Datenbank auf diese Weise für uns verhindert, nennt man Anomalien oder auch Foreign-Key-Constraint.  

dbVerbindung.connect(function(fehler){

    // Mit der Angabe des FK: (FOREIGN KEY (quellIban) REFERENCES konto(iban)) werden 
    // Anomalien verhindert. Es ist durch die Angabe des FK nicht möglich ein Konto
    // zu löschen, zu dem noch Kontobewegungen existieren. (LÖSCHANOMALIE)
    // Es ist auch nicht möglich eine Kontobewegung zu einer IBAN einzutragen, 
    // die es nicht gibt. (EINFÜGEANOMALIE)

    dbVerbindung.query('CREATE TABLE kontobewegung(quellIban VARCHAR(22), zielIban VARCHAR(22), betrag DECIMAL(15,2), verwendungszweck VARCHAR(378), timestamp TIMESTAMP, PRIMARY KEY(quellIban, timestamp), FOREIGN KEY (quellIban) REFERENCES konto(iban));', function (fehler) {
        if (fehler) {
            if(fehler.code == "ER_TABLE_EXISTS_ERROR"){
                console.log("Tabelle kontobewegung existiert bereits und wird nicht angelegt.")
            }else{
                console.log("Fehler: " + fehler.code)
            }
        }else{
            console.log("Tabelle kontobewegung erfolgreich angelegt.")
        }
    })
})

// Kunde in die Datenbank schreiben, sofern er noch nicht angelegt ist

const app = express()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

const server = app.listen(process.env.PORT || 3000, () => {

    // Ausgabe von 'Server lauscht ...' im Terminal
    console.log('Server lauscht auf Port %s', server.address().port)    
})

// Wenn die Startseite im Browser aufgerufen wird, ...

app.get('/',(req, res, next) => {   
   
    if(req.cookies['istAngemeldetAls'] != "" && req.cookies['istAngemeldetAls'] != undefined){

    console.log(req.cookies['istAngemeldetAls'])
    
    // Das Kundenobjekt wird instanziiert.
    // Deklaration = Bekanntgabe: let kunde
    // Instanziierung = Erkennbar am reservierten Wort "new". Speicherzellen im Arbeitsspeicher werden reserviert.
    // Initialisierung: Werte werden Werte zugewiesen und in die reservierten Speicherzellen geschrieben.
    
    let kunde = new Kunde()

    // Der Cookie speichert das Kundenobjekt als primitiven, einwertigen String.
    console.log("Cookie:")

    // Das Kundenobjekt wird aus dem Cookie initialisiert.
    
    kunde = JSON.parse(req.cookies['istAngemeldetAls'])
        
    console.log(kunde)

        // Die Funktion find() gibt das Wetter zu den Angaben in den runden Klammern zurück.
        weather.find({search: kunde.Ort, degreeType: 'C'}, function(fehler, result) {
            
            // Wenn ein Fehler auftritt, werden wir auf die Login-Seite zurückgeworfen, 
            // weil das Kundenobjekt dann NULL ist
            if(fehler){
                res.render('login.ejs', {      
                    meldung : "Bitte erneut anmelden!"
                })            
            }
    
            // stringify ist eine Funktion, die auf das JSON-Objekt aufgerufen den result in einem
            // langen String zurückgibt. 
            console.log(JSON.stringify(result, null, 2));

            console.log("Der ganze Result: " + result)
            // Der Result ist eine Liste von Objekten. Wenn der angegebene Ortsname mehrfach existiert, hat die Liste mehr als einen Eintrag.
            console.log("Vom ersten Element der Name des Orts " + result[0].location.name);
            console.log("Vom ersten Element die aktuelle Temperatur :" + result[0].current.temperature);
    
            res.render('index.ejs', {    
                ort : kunde.Ort,
                meldungWetter : result[0].current.temperature + " °" + result[0].location.degreetype,  
                meldung : "Portnummer: " + (process.env.PORT || 3000) + ", Kunde: " + kunde.Vorname + " " + kunde.Nachname + "(" + kunde.IdKunde + ")"    
            }) 
        });        
    }    
    else{
        res.render('login.ejs', {      
            meldung : ""
        })    
    }
})

app.post('/',(req, res, next) => {   
    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
            
        let neuerOrt = req.body.ort

        // Wenn der neueOrt aus dem Input nicht leer oder null ist, dann
        // wird der neueOrt an die Variable ort zugewiesen.
        // Ansonsten bleibt es bei dem hart eincodierten Wert von ort

        if(neuerOrt){
            ort = neuerOrt
        }

        weather.find({search: ort, degreeType: 'C'}, function(err, result) {
            if(err) console.log(err);
    
            res.render('index.ejs', {    
                ort : result[0].location.name,
                meldungWetter :  result[0].current.temperature + " °" + result[0].location.degreetype,  
                meldung : "Portnummer: " + (process.env.PORT || 3000) + ", Kunde: " + kunde.Vorname + " " + kunde.Nachname + "(" + kunde.IdKunde + ")"      
            }) 
        });        
    }else{            
        res.render('login.ejs', {     
            meldung : ""               
        })
    }
})

app.post('/login',(req, res, next) => {   
    
    // Der Wert des Inputs mit dem name = "idkunde" wird über
    // den Request zugewiesen an die Konstante idKunde
    const idKunde = req.body.idKunde
    
    // Der Wert des Inputs mit dem Namen "kennwort" wird requested und zugewiesen an eine
    // Konstante namens kennwort.
    const kennwort = req.body.kennwort
    
    dbVerbindung.connect(function(fehler){
        
        // Alle Spalten (*) werden ausgewählt. Es wird auf alle zeilen gefiltert, bei denen die ID-Kunde
        // und das Kennwort matcht.
        dbVerbindung.query('SELECT * FROM kunde WHERE idKunde = ' + idKunde + ' AND kennwort = "' + kennwort + '";', function (fehler, result) {
            
            // Wenn ein Fehler passiert, wird der Fehler geworfen.
            // Wenn ein Fehler passiert, ist das Fehler-Objekt nicht NULL. 
            // Ein Objekt, das nicht NULL ist, ist true.
            if (fehler) throw fehler
            
            console.log(result.length)
    
            // Wenn die Anzahl der Einträge im result 1 ist, dann existiert genau ein Kunde 
            // mit dieser Kombination aus idKunde und Kennwort.

            if(result.length == 1){
                
                // Deklaration "let kunde" und Instanziierung "= new Kunde()"
                // Bei der Instanziierung werden Speicherzellen reserviert.
                // Das Objekt wird im Gegensatz zur Klasse kleingeschrieben.

                let kunde = new Kunde()

                // Initialisierung

                // Der result ist eine Liste von Datensätzen. Wir wissen, dass diese Liste nur einen
                // Datensatz enthält. Also greifen wir uns die Eigenschaftswerte dieses datensatzes über
                // die Angabe des Index hinter dem result. [0] steht für den ersten Datensatz

                kunde.IdKunde = result[0].idKunde
                kunde.Nachname = result[0].nachname
                kunde.Vorname = result[0].vorname        
                kunde.Mail = result[0].mail
                kunde.Ort = result[0].ort
                kunde.Kennwort = result[0].kennwort
                
                console.log(kunde)
                
                // Der Browser kann während des Hin- und Herschaltens in der App nicht wissen,
                // dass immer dieselbe Person vor ihm sitzt. Damit der Browser während der ganzen Sitzung 
                // weiß, wer ihn bedient, wird das ganze Kundenobjekt im Cookie gespeichert.
                // Da der Cookie nur einen Text aufnehmen kann, das Kundenobbejkt aber ein komplexer Datentyp
                // ist, wird mit der Methode JSON.stringify() das Kundenobjekt in einen String umgewandelt.
                // Zuletzt wird der Cookie an den Browser respondet

                res.cookie('istAngemeldetAls', JSON.stringify(kunde))

                console.log("Der Cookie nach Login wird gesetzt: " + JSON.stringify(kunde))
            
                weather.find({search: kunde.Ort, degreeType: 'C'}, function(err, result) {
                    if(err) console.log(err);
            
                    res.render('index.ejs', {    
                        ort : result[0].location.name,
                        meldungWetter :  result[0].current.temperature + " °" + result[0].location.degreetype,  
                        meldung : "Portnummer: " + (process.env.PORT || 3000) + ", Kunde: " + kunde.Vorname + " " + kunde.Nachname + "(" + kunde.IdKunde + ")" 
                    }) 
                });
            }else{

                // Wenn die Anzahl der passenden Einträge in der Datenbank != 1 ist, dann bleiben wir auf der Login-Seite

                console.log("Der Cookie wird gelöscht")
                res.cookie('istAngemeldetAls','')
                res.render('login.ejs', {                    
                    meldung : "Falsche Zugangsdaten. Bitte geben Sie die richtigen Zugangsdaten ein!"
                })
            }
        })
    })
})

// Wenn die Seite localhost:3000/impressum aufgerufen wird, ...

app.get('/impressum',(req, res, next) => {   

    // Beim Klick auf die Impressum-Seite wird bei jedem einzelnen Benutzer der App
    // ein neues Kundenobjekt deklariert und instanziiert.
    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
        
        console.log(kunde)
        console.log("ID des Kunden" + kunde.IdKunde)
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // ... dann wird impressum.ejs gerendert.
        
        res.render('impressum.ejs', {                              
        })
    }else{
        res.render('login.ejs', {         
            meldung : ""           
        })    
    }
})

app.get('/login',(req, res, next) => {         
    res.cookie('istAngemeldetAls', '')       
    res.render('login.ejs', {     
        meldung : ""               
    })
})

// Wenn die Seite localhost:3000/kontoAnlegen angesurft wird, ...

app.get('/kontoAnlegen',(req, res, next) => {   
    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // ... dann wird kontoAnlegen.ejs gerendert.
        
        res.render('kontoAnlegen.ejs', {    
            meldung : ""                          
        })
    }else{
        res.render('login.ejs', {                    
            meldung : ""
        })    
    }
})

// Wenn der Button auf der kontoAnlegen-Seite gedrückt wird, ...

app.post('/kontoAnlegen',(req, res, next) => {   
   
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        let konto = new Konto()

        // Der Wert aus dem Input mit dem Namen 'kontonummer'
        // wird zugewiesen (=) an die Eigenschaft Kontonummer
        // des Objekts namens konto.
        konto.IdKunde = kunde.IdKunde
        konto.Kontonummer = req.body.kontonummer
        
        if(konto.Kontonummer == "" || konto.Kontonummer.length != 4){
            res.render('kontoAnlegen.ejs', {                              
                meldung : "Zum Kontoanlegen exakt 4 Ziffern angeben!"
            })                             
        }else{
            konto.Kontoart = req.body.kontoart
            const bankleitzahl = 27000000
            const laenderkennung = "DE"
            konto.Iban = iban.fromBBAN(laenderkennung,bankleitzahl + " " + kunde.IdKunde + konto.Kontonummer)
            
            // Füge das Konto in die MySQL-Datenbank ein
        
            dbVerbindung.query('INSERT INTO konto(iban, idKunde, kontoart, timestamp) VALUES ("' + konto.Iban + '","' + kunde.IdKunde + '","' + konto.Kontoart + '",NOW());', function (fehler) {
                if (fehler) {
                    if(fehler.code == "ER_DUP_ENTRY"){
                        console.log("Konto mit Iban " + konto.Iban + " existiert bereits und wird nicht erneut in DB angelegt." );
                        // ... wird die kontoAnlegen.ejs gerendert.

                        res.render('kontoAnlegen.ejs', {                              
                            meldung : "Konto mit Iban " + konto.Iban + " existiert bereits und wird nicht erneut in DB angelegt." 
                        })
                    }else{
                        console.log("Fehler: " + fehler.code)
                        res.render('kontoAnlegen.ejs', {                              
                            meldung : "Sonstiger Fehler: " + fehler.code
                        })
                    }
                }else{
                    console.log("Konto mit Iban " + konto.Iban + " erfolgreich in DB angelegt.");    
                    res.render('kontoAnlegen.ejs', {                              
                        meldung : "Konto mit Iban " + konto.Iban + " erfolgreich in DB angelegt."
                    })                             
                }            
            })
        }
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {         
            meldung : ""           
        })    
    }
})

app.get('/stammdatenPflegen',(req, res, next) => {   

    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // ... dann wird kontoAnlegen.ejs gerendert.
        
        res.render('stammdatenPflegen.ejs', {    
            meldung : "",
            nachname : kunde.Nachname,
            vorname : kunde.Vorname,
            ort : kunde.Ort,
            mail : kunde.Mail,
            kennwort : kunde.Kennwort
        })
    }else{
        res.render('login.ejs', {           
            meldung : ""         
        })    
    }
})

app.post('/stammdatenPflegen',(req, res, next) => {   

    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        let nachname = req.body.nachname
        let vorname = req.body.vorname
        let mail = req.body.mail
        let kennwort = req.body.kennwort
        let ort = req.body.ort

        // Wenn einer der Eigenschftswerte verändert wurde, ...

        if (nachname != kunde.Nachname || vorname != kunde.Vorname || mail != kunde.Mail || kennwort != kunde.Kennwort || ort != kunde.Ort){

            // dann wird die Datenbank geöffnet ...
            dbVerbindung.connect(function(fehler){

                // und der Kundendatensatz aktualisiert

                if (kennwort == ""){
                    kennwort = kunde.Kennwort
                    console.log("Kunden: " + kunde.Nachname)
                }

                dbVerbindung.query('UPDATE kunde SET nachname = "' + nachname + '", ort = "' + ort + '", kennwort = "' + kennwort + '", vorname = "' + vorname +'" WHERE (idKunde = ' + kunde.IdKunde + ');', function (fehler) {
                    if (fehler) throw fehler
         
                    console.log("Stammdaten wurden erfolgreich aktualisiert")
                    kunde.Nachname = nachname
                    kunde.Vorname = vorname
                    kunde.Mail = mail
                    kunde.Ort = ort
                    kunde.Kennwort = kennwort

                    console.log(kunde)

                    res.render('stammdatenPflegen.ejs', {                              
                        meldung : "Stammdaten wurden erfolgreich aktualisiert",
                        nachname : kunde.Nachname,
                        vorname : kunde.Vorname,
                        mail : kunde.Mail,
                        ort : kunde.Ort,
                        kennwort : kunde.Kennwort
                    })
                })
            })
        }
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {          
            meldung : ""          
        })    
    }
})

// Die Funktion wird aufgerufen, wenn die Seite ueberweisen im Browser aufgerufen wird.

app.get('/ueberweisen',(req, res, next) => {   
    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    

        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // Es wird eine neue Variable deklariert namens quellkonten. Die Variable lebt innerhalb der if(idKunde)-Kontrollstruktur.

        let quellkonten

        dbVerbindung.connect(function(fehler){
            dbVerbindung.query('SELECT iban FROM konto WHERE idKunde = "' + kunde.IdKunde + '";', function (fehler, quellkontenResult) {
                if (fehler) throw fehler
                
                console.log(quellkontenResult)
        
                // Der neuen Varablen quellkonten wird der Result aus der Datenbankabfrage zugewiesen

                quellkonten = quellkontenResult
            })
        })

        dbVerbindung.connect(function(fehler){
            dbVerbindung.query('SELECT iban FROM konto;', function (fehler, zielkontenResult) {
                if (fehler) throw fehler
                
                console.log(zielkontenResult)
        
                // Die ueberweisen-Seite wid mit den übergebeben quellkonten und zielkonten an den Browser übergeben.

                res.render('ueberweisen.ejs', {    
                    meldung : "",
                         quellkonten : quellkonten,
                         zielkonten : zielkontenResult                     
                })
            })
        })
    }else{
        res.render('login.ejs', {                    
            meldung : ""
        })    
    }
})

// Die app.post wird abgearbeitet, wenn der Button auf dem Formular gedrückt wird.

app.post('/ueberweisen',(req, res, next) => {   
    if(req.cookies['istAngemeldetAls'] != ""){
        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // Die quelliban und zieliban wird "requestet", d. h. beim Browser angefragt und den Variablen zugewiesen

        var quellIban = req.body.quellIban
        var zielIban = req.body.zielIban

        // Wenn Quell- und Zieliban gleich sind, wird eine Meldung gerendert.

        if(quellIban === zielIban){
            res.render('index.ejs', {                              
                meldung : "Die Quelliban und die Zieliban dürfen nicht übereinstimmen.",
                meldungWetter : "",
                ort : ort
            })    
        }else{
            var betrag = req.body.betrag

            if(betrag < 0){
                res.render('index.ejs', {                              
                    meldung : "Bitte nur positive Eurobeträge eingeben.",
                    ort : ort,
                    meldungWetter : ""
                })    
            }else{
                var verwendungszweck = req.body.verwendungszweck
            
                if(verwendungszweck == ""){
                    res.render('index.ejs', {                              
                        meldung : "Bitte einen Verwendungszweck eingeben.",
                        meldungWetter : "",
                        ort : ort
                    })  
                }else{

                    console.log("Überweisung wird ausgeführt: " + quellIban + " -> " + zielIban + "| Betrag: " + Math.abs(betrag) + " | Vz:" + verwendungszweck)

                    // Kontobewegungen einfügen 
    
                    dbVerbindung.query('INSERT INTO kontobewegung(quellIban, zielIban, timestamp, betrag, verwendungszweck) VALUES ("' + quellIban + '","' + zielIban + '",NOW(),' + betrag + ',"' + verwendungszweck + '");', function (fehler) {
                        if (fehler){
                            if(fehler){
                                console.log("Überweisung auf Konto " + zielIban + " konnte nicht ausgeführt werden." + fehler)
                            }               
                        }else{
                            console.log("Überweisung auf Konto " + zielIban + " erfolgreich durchgeführt.");
                        }            
                    })
    
                    // ... wird die kontoAnlegen.ejs gerendert.
    
                    res.render('index.ejs', {                              
                        meldung : "Die Überweisung an " + zielIban + " wurde erfolgreich durchgeführt.",
                        meldungWetter : "",
                        ort : kunde.Ort
                    })
                }                
            }
        }
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {            
            meldung : ""        
        })    
    }
})


app.get('/zinsen',(req, res, next) => {   
    
    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    

        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // ... dann wird kontoAnlegen.ejs gerendert.
        
        res.render('zinsen.ejs', {    
            meldung : ""                          
        })
    }else{
        res.render('login.ejs', {     
            meldung : ""               
        })    
    }
})

app.post('/zinsen',(req, res, next) => {   

    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
      
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        var zinssatz = parseFloat(req.body.zinssatz)
        var anfangskapital = req.body.anfangskapital
        var gesamtLaufzeit = req.body.laufzeit
        var endkapital = anfangskapital

        console.log("zinssatz: " + zinssatz)
        console.log("Anfangskapital: " + anfangskapital)
        console.log("Laufzeit: " + gesamtLaufzeit)
        console.log("Endkapital vor der Laufzeit: " + endkapital)

        // Wenn rechts oder links vom Plus-Operator ein String steht, wird der Plus-Operator eine Verkettung durchführen.
        // Wenn links und rechts eine Zahl steht, wird eine Addition vorgenommen.
        // Die Zahlen aus dem Request sind Strings. Also müssen sie erst konvertiert werden.

        for(restLaufzeit = gesamtLaufzeit; restLaufzeit > 0; restLaufzeit--){
            endkapital = parseFloat(endkapital) + (parseFloat(endkapital) * (parseFloat(zinssatz) / 100))
            console.log(endkapital + "= (parseFloat(" + endkapital + ") * (parseFloat(" + zinssatz + ") / 100))")
            console.log("Endkapital nach " + (gesamtLaufzeit - restLaufzeit) + " Jahren: " + endkapital)
        }
        

        res.render('zinsen.ejs', {                              
            meldung : "Aus dem Anfangskapital i.H.v. " + anfangskapital + " Euro wird bei einem Zinssatz von " + zinssatz + " Prozent nach " + gesamtLaufzeit + " Jahren der Endbetrag " + endkapital + " Euro."
        })
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {                   
            meldung : "" 
        })    
    }
})

app.get('/kontoAnzeigen',(req, res, next) => {   

    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])

        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // Hier muss die Datenbank abgefragt werden.

        dbVerbindung.connect(function(fehler){
            dbVerbindung.query('SELECT iban FROM konto WHERE idKunde = "' + kunde.IdKunde + '";', function (fehler, result) {
                if (fehler) throw fehler
                
                res.render('kontoAnzeigen.ejs', {    
                    konten : result
                })
            })
        })
    }else{
        res.render('login.ejs', {                    
            meldung : ""
        })    
    }
})

app.post('/kontoAnzeigen',(req, res, next) => {   

    if(req.cookies['istAngemeldetAls'] != ""){

        let kunde = new Kunde();
        kunde = JSON.parse(req.cookies['istAngemeldetAls'])
    
        console.log("Kunde ist angemeldet als " + kunde.IdKunde)
        
        // Die Iban wird requestet       

        var iban = req.body.iban
        var kontostand = 0     
        console.log("Konto " + iban + " wird abgefragt.")

        // Kontobewegungen einfügen

        dbVerbindung.query('SELECT betrag FROM kontobewegung WHERE quelliban = "' + iban + '";', function (fehler, result) {
            if (fehler) throw fehler
            
            for(var i = 0;i < result.length;i++){                
                kontostand = kontostand - result[i].betrag                
            }

            dbVerbindung.query('SELECT betrag FROM kontobewegung WHERE zieliban = "' + iban + '";', function (fehler, result) {
                if (fehler) throw fehler
                
                for(var i = 0;i < result.length;i++){                
                    kontostand = kontostand + result[i].betrag                
                }
                console.log("Kontostand der Iban " + iban + " ist: " + kontostand + ".")

                // ... wird die kontoAnlegen.ejs gerendert.
        
                res.render('index.ejs', {                              
                    meldung : "Der Kontostand des Kontos mit der IBAN " + iban + " beträgt: " + kontostand + " €.",
                    ort : kunde.Ort,
                    meldungWetter : ""
                })
            })
        })
    }else{
        // Die login.ejs wird gerendert 
        // und als Response
        // an den Browser übergeben.
        res.render('login.ejs', {                    
            meldung : ""
        })    
    }
})

