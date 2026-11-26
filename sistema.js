const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COP=n=>'$'+Math.round(n).toLocaleString('es-CO');
const CIU={BAQ:'Barranquilla',BOG:'Bogotá',MDE:'Medellín',CTG:'Cartagena',CLO:'Cali',SAP:'San Andrés',SMR:'Santa Marta',MIA:'Miami',MAD:'Madrid',PTY:'Ciudad de Panamá',JFK:'New York',CDG:'París',EZE:'Buenos Aires',MEX:'Ciudad de México',GRU:'São Paulo',SCL:'Santiago de Chile'};
const CL={E:{n:'Económica',f:1,kg:23,g:3},B:{n:'Business',f:2.4,kg:32,g:2},P:{n:'Primera',f:4,kg:40,g:1}};
const R0=[['BAQ','BOG',420000,65],['BAQ','MDE',380000,60],['BAQ','CLO',450000,85],['BOG','MDE',210000,50],['BOG','CTG',390000,75],['BOG','MIA',1250000,200],['MDE','CTG',330000,65],['BOG','SAP',520000,115],['BOG','SMR',380000,70],['BOG','PTY',700000,105],['BOG','MAD',3200000,610],['BOG','JFK',1900000,340],['BOG','CDG',3500000,650],['BOG','EZE',1700000,390],['BOG','MEX',1300000,200],['BOG','GRU',1600000,370],['BOG','SCL',1500000,350],['BAQ','SMR',300000,45],['BAQ','SAP',480000,105],['BAQ','MIA',1100000,190],['BAQ','PTY',650000,95],['MDE','MIA',1150000,200],['MDE','PTY',640000,90],['CTG','SAP',420000,85],['CLO','MIA',1200000,210]];
const RUTAS=R0.concat(R0.map(r=>[r[1],r[0],r[2],r[3]]));
const AVIONES=[{cod:'AV-101',mod:'Airbus A320',fab:'Airbus',cap:180,e:150,b:24,p:6,anio:2018,estado:'Operativo'},{cod:'AV-102',mod:'Boeing 737-800',fab:'Boeing',cap:174,e:144,b:24,p:6,anio:2016,estado:'Operativo'},{cod:'AV-103',mod:'Embraer E190',fab:'Embraer',cap:100,e:84,b:12,p:4,anio:2020,estado:'Mantenimiento'}];
const VUELOS=[];
RUTAS.forEach((r,i)=>['06:15','09:50','14:30','19:05'].forEach((h,j)=>VUELOS.push({cod:'AV'+(100+i*4+j),o:r[0],d:r[1],h,dur:r[3],base:r[2],avion:AVIONES[(i+j)%2].cod,puerta:'A'+(1+(i+j)%9),term:1+j%2,estado:'Programado'})));
const addMin=(h,m)=>{const t=(+h.slice(0,2))*60+(+h.slice(3))+m,x=((t%1440)+1440)%1440;return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0')};
const hash=s=>{let h=7;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h};
const fdate=d=>new Date(d+'T12:00').toLocaleDateString('es-CO',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
const bars=seed=>{let x='',p=0,h=hash(seed);for(let i=0;i<48;i++){h=(h*1103515245+12345)>>>0;const w=1+(h>>>8)%3;if(i%2==0)x+=`<rect x="${p}" y="0" width="${w}" height="40" fill="currentColor"/>`;p+=w}return`<svg class="bc" viewBox="0 0 ${p} 40" preserveAspectRatio="none" role="img" aria-label="Código de barras">${x}</svg>`};
let RES=[];try{RES=JSON.parse(localStorage.getItem('aerovia')||'[]')}catch(e){}
const save=()=>{try{localStorage.setItem('aerovia',JSON.stringify(RES))}catch(e){}};
const HOY=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10),SEMANA=new Date(Date.now()+7*864e5-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
const S={step:1,q:{o:'BAQ',d:'BOG',f:SEMANA,n:1,c:'E'},v:null,seats:[],err:'',done:null};
const cabin=r=>r<=2?'P':r<=5?'B':'E';
// PRECIOS DINAMICOS DE LOS VUELOS
const PRECIOS = {};


function price(v, c) {

    // Identificar ruta, horario y clase
    const clave = `${v.o}-${v.d}-${v.h}-${c}`;

    // Conservar el precio calculado
    if (PRECIOS[clave] !== undefined) {
        return PRECIOS[clave];
    }

    // Variacion aleatoria para cada horario
    const variacion = 0.90 + Math.random() * 0.20;

    // Calcular precio segun ruta, horario y clase
    const precio = v.base * CL[c].f * variacion;

    // Redondear a miles
    PRECIOS[clave] = Math.round(precio / 1000) * 1000;

    return PRECIOS[clave];
}


const occ=(v,f,s)=>hash(v.cod+f+s)%100<28;

function stepper(){const n=['Vuelo','Asientos','Pasajeros','Pago','Boleto'];return`<ol class="steps">${n.map((t,i)=>`<li class="${S.step==i+1?'on':S.step>i+1?'done':''}">${t}</li>`).join('')}</ol>`}
function opts(sel){return Object.keys(CIU).map(k=>`<option value="${k}"${k==sel?' selected':''}>${CIU[k]} (${k})</option>`).join('')}

function vReservar(){
 let h='';
 if(S.step==1){
  const q=S.q,res=VUELOS.filter(v=>v.o==q.o&&v.d==q.d);
  h=`<section class="hero"><div><h1>¿A dónde<br>vuelas hoy?</h1><p>Busca tu vuelo, elige tu asiento y recibe tu boleto electrónico en minutos.</p></div>
  <div class="board" aria-label="Próximas salidas"><h3>Próximas salidas</h3><table>${VUELOS.filter((v,i)=>i%9==0).slice(0,5).map(v=>`<tr><td>${v.h}</td><td>${v.o} › ${v.d}</td><td>${v.cod}</td><td>Puerta ${v.puerta}</td></tr>`).join('')}</table></div></section>
  <div class="card"><div class="grid cols">
  <div><label for="o">Origen</label><select id="o">${opts(q.o)}</select></div>
  <div><label for="d">Destino</label><select id="d">${opts(q.d)}</select></div>
  <div><label for="f">Fecha de salida</label><input id="f" type="date" min="${HOY}" value="${q.f}"></div>
  <div><label for="n">Pasajeros</label><select id="n">${[1,2,3,4,5,6].map(i=>`<option${i==q.n?' selected':''}>${i}</option>`).join('')}</select></div>
  <div><label for="c">Clase</label><select id="c">${Object.keys(CL).map(k=>`<option value="${k}"${k==q.c?' selected':''}>${CL[k].n}</option>`).join('')}</select></div></div>
  <div class="actions"><button onclick="buscar()">Buscar vuelos</button></div>${S.err?`<div class="msg bad">${S.err}</div>`:''}</div>
  <h2 style="margin:1.8rem 0 .8rem">${CIU[q.o]} a ${CIU[q.d]} · ${fdate(q.f)}</h2>
  ${res.length?res.map(v=>`<div class="card flight"><div class="route"><div>${v.h}<small>${v.o}</small></div><span class="line"></span><div>${addMin(v.h,v.dur)}<small>${v.d}</small></div><small style="margin-left:.5rem">${Math.floor(v.dur/60)}h ${v.dur%60}min · ${v.cod}</small></div>
  <div class="price"><b>${COP(price(v,q.c)*q.n)}</b><small style="color:var(--muted)">${CL[q.c].n} · ${q.n} pasajero${q.n>1?'s':''}</small><button style="margin-top:.4rem" onclick="elegir('${v.cod}')">Elegir vuelo</button></div></div>`).join(''):'<div class="msg">No hay vuelos directos para esa ruta. Prueba saliendo desde Bogotá (BOG), nuestro aeropuerto principal.</div>'}`;
 }
 if(S.step==2){const v=S.v,q=S.q;let rows='';
  for(let r=1;r<=14;r++){rows+=`<div class="row"><i>${r}</i>`+'ABCDEF'.split('').map((c,i)=>{const id=r+c,k=cabin(r),o=occ(v,q.f,id),on=S.seats.includes(id),dis=o||k!=q.c;return(i==3?'<span class="gap"></span>':'')+`<button class="seat ${k} ${on?'sel':''} ${o?'occ':''}" ${dis?'disabled':''} aria-pressed="${on}" aria-label="Asiento ${id}" onclick="asiento('${id}')">${c}</button>`}).join('')+'</div>'}
  h=`<h2>Elige tu${q.n>1?'s':''} asiento${q.n>1?'s':''} · ${v.cod} ${v.o} a ${v.d}</h2><p style="color:var(--muted)">Selecciona ${q.n} asiento${q.n>1?'s':''} de clase ${CL[q.c].n}. Seleccionados: ${S.seats.length}/${q.n}.</p>
  <div class="card"><div class="legend"><span>Primera: borde amarillo</span><span>Business: borde azul</span><span>Gris: ocupado</span></div><div class="seats">${rows}</div></div>
  ${S.err?`<div class="msg bad">${S.err}</div>`:''}<div class="actions"><button class="alt" onclick="ir(1)">Cambiar vuelo</button><button onclick="sigAsientos()">Continuar</button></div>`}
 if(S.step==3){h=`<h2>Datos de los pasajeros</h2><div class="card"><div class="grid">${S.seats.map((s,i)=>`<fieldset style="border:1px solid var(--line);border-radius:8px"><legend>Pasajero ${i+1} · asiento ${s}</legend><div class="grid cols">
  <div><label>Nombre</label><input class="pn" autocomplete="given-name"></div><div><label>Apellido</label><input class="pa"></div>
  <div><label>Tipo de documento</label><select class="pt"><option>CC</option><option>Pasaporte</option><option>CE</option><option>TI</option></select></div><div><label>Número de documento</label><input class="pd" inputmode="numeric"></div></div></fieldset>`).join('')}
  <div class="grid cols"><div><label>Correo de contacto</label><input id="mail" type="email"></div><div><label>Celular</label><input id="cel" type="tel"></div></div></div></div>
  ${S.err?`<div class="msg bad">${S.err}</div>`:''}<div class="actions"><button class="alt" onclick="ir(2)">Volver</button><button onclick="sigPax()">Continuar al pago</button></div>`}
 if(S.step==4){const t=price(S.v,S.q.c)*S.seats.length;h=`<h2>Pago</h2><div class="card"><p>${S.v.o} a ${S.v.d} · ${fdate(S.q.f)} · ${S.seats.length} × ${COP(price(S.v,S.q.c))}</p><p><b style="font:700 2rem 'Barlow Condensed'">Total ${COP(t)} COP</b></p>
  <div class="grid cols"><div><label for="mp">Método de pago</label><select id="mp" onchange="$('#cu').disabled=this.value!='Tarjeta de crédito'"><option>Tarjeta de crédito</option><option>Tarjeta débito</option><option>PSE</option></select></div>
  <div><label for="cu">Cuotas</label><select id="cu"><option>1</option><option>3</option><option>6</option><option>12</option></select></div>
  <div><label for="tj">Número de tarjeta o cuenta</label><input id="tj" inputmode="numeric" placeholder="Solo simulación"></div></div></div>
  ${S.err?`<div class="msg bad">${S.err}</div>`:''}<div class="actions"><button class="alt" onclick="ir(3)">Volver</button><button onclick="pagar()">Pagar ${COP(t)}</button></div>`}
 if(S.step==5){const r=S.done;h=`<div class="msg ok">Reserva <b>${r.cod}</b> confirmada. Guarda este código para hacer check-in.</div>${tickets(r)}<div class="actions"><button onclick="location.hash='checkin'">Ir a check-in</button><button class="alt" onclick="window.print()">Imprimir</button><button class="alt" onclick="nueva()">Nueva reserva</button></div>`}
 return(S.step<5||true?stepper():'')+h}


function tickets(r) {
    return r.pax.map(p => {

        const datosQR = [
            'AEROBOOK - BOLETO ELECTRONICO',
            'Reserva: ' + r.cod,
            'Pasajero: ' + p.n + ' ' + p.a,
            'Vuelo: ' + r.v.cod,
            'Origen: ' + CIU[r.v.o],
            'Destino: ' + CIU[r.v.d],
            'Fecha: ' + r.f,
            'Salida: ' + r.v.h,
            'Asiento: ' + p.s,
            'Precio: ' + COP(p.pr)
        ].join('\n');

        const qr = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data='
            + encodeURIComponent(datosQR);

        return `
        <div class="ticket">
            <div class="top">
                <span>AEROBOOK · BOLETO ELECTRÓNICO</span>
                <span>${CL[r.c].n}</span>
            </div>

            <div class="main">
                <div class="route">
                    <div>${r.v.o}<small>${CIU[r.v.o]}</small></div>
                    <span class="line"></span>
                    <div>${r.v.d}<small>${CIU[r.v.d]}</small></div>
                </div>

                <div class="kv">
                    <div><span>Pasajero</span><b>${esc(p.n)} ${esc(p.a)}</b></div>
                    <div><span>Vuelo</span><b>${r.v.cod}</b></div>
                    <div><span>Fecha</span><b>${fdate(r.f)}</b></div>
                    <div><span>Salida</span><b>${r.v.h}</b></div>
                    <div><span>Asiento</span><b>${p.s}</b></div>
                    <div><span>Precio</span><b>${COP(p.pr)}</b></div>
                </div>
            </div>

            <div class="stub" style="text-align:center;padding:15px;">
                <img src="${qr}" alt="Código QR del boleto"
                     width="160" height="160"
                     style="display:block;margin:0 auto;">
                <small style="color:var(--muted);">
                    ESCANEA TU QR · ${r.cod}-${p.s}
                </small>
            </div>
        </div>`;
    }).join('');
}

function buscar(){const q=S.q;q.o=$('#o').value;q.d=$('#d').value;q.f=$('#f').value;q.n=+$('#n').value;q.c=$('#c').value;S.err=q.o==q.d?'El origen y el destino deben ser distintos.':!q.f||q.f<HOY?'Elige una fecha de hoy en adelante.':'';render()}
function elegir(c){S.v=VUELOS.find(v=>v.cod==c);S.seats=[];S.err='';S.step=2;render();scrollTo(0,0)}
function asiento(id){const i=S.seats.indexOf(id);if(i>=0)S.seats.splice(i,1);else if(S.seats.length<S.q.n)S.seats.push(id);else{S.seats.shift();S.seats.push(id)}render()}
function ir(n){S.step=n;S.err='';render();scrollTo(0,0)}
function sigAsientos(){if(S.seats.length!=S.q.n){S.err=`Selecciona ${S.q.n} asiento${S.q.n>1?'s':''} para continuar.`;return render()}ir(3)}
function sigPax(){const N=[...document.querySelectorAll('.pn')].map(e=>e.value.trim()),A=[...document.querySelectorAll('.pa')].map(e=>e.value.trim()),T=[...document.querySelectorAll('.pt')].map(e=>e.value),D=[...document.querySelectorAll('.pd')].map(e=>e.value.trim());
 if([...N,...A,...D].some(x=>!x)||!/^\S+@\S+\.\S+$/.test($('#mail').value)){S.err='Completa nombre, apellido y documento de cada pasajero, y un correo válido.';return render()}
 S.pax=S.seats.map((s,i)=>({n:N[i],a:A[i],t:T[i],d:D[i],s,pr:price(S.v,S.q.c)}));S.mail=$('#mail').value;ir(4)}
function pagar(){if(!/^\d{6,}$/.test($('#tj').value.replace(/\s/g,''))){S.err='Escribe un número de tarjeta o cuenta de al menos 6 dígitos.';return render()}
 const cod='RS-'+(hash(Date.now()+S.v.cod)%90000+10000),r={cod,v:S.v,f:S.q.f,c:S.q.c,pax:S.pax,mail:S.mail,total:S.pax.length*price(S.v,S.q.c),pago:{m:$('#mp').value,cu:$('#cu').value,ref:'TX'+hash(cod)},estado:'Confirmada',ci:false};
 RES.push(r);save();S.done=r;S.step=5;render();scrollTo(0,0)}
function nueva(){S.step=1;S.seats=[];S.v=null;render()}

let CI={cod:'',msg:'',kg:{}};
function vCheckin(){let h=`<h1 style="font-size:3rem">Check-in</h1><p style="color:var(--muted)">Ingresa el código de tu reserva (por ejemplo RS-12345).</p><div class="card"><div class="grid cols"><div><label for="rc">Código de reserva</label><input id="rc" value="${esc(CI.cod)}"></div></div><div class="actions"><button onclick="buscarRes()">Buscar reserva</button>${RES.length?`<button class="alt" onclick="CI.cod='${RES[RES.length-1].cod}';render()">Usar mi última reserva</button>`:''}</div></div>`;
 if(CI.msg)h+=`<div class="msg bad">${CI.msg}</div>`;
 const r=RES.find(x=>x.cod==CI.cod.toUpperCase());
 if(r){if(r.estado=='Cancelada')h+='<div class="msg bad">Esta reserva está cancelada.</div>';else if(!r.ci){h+=`<h2 style="margin:1.5rem 0 .6rem">Equipaje</h2><div class="card"><p style="color:var(--muted)">Tu clase incluye ${CL[r.c].kg} kg por pasajero. El exceso cuesta ${COP(15000)} por kg.</p><div class="grid cols">${r.pax.map((p,i)=>`<div><label>${esc(p.n)} ${esc(p.a)} · peso en kg</label><input type="number" min="0" max="60" value="${CI.kg[i]??10}" oninput="CI.kg[${i}]=+this.value"></div>`).join('')}</div><div class="actions"><button onclick="hacerCI('${r.cod}')">Hacer check-in</button></div></div>`}
 else h+=`<div class="msg ok">Check-in completado. Presenta estos pases en la puerta ${r.v.puerta}.</div>`+r.pax.map(p=>`<div class="ticket"><div class="top"><span>PASE DE ABORDAR</span><span>Grupo ${CL[r.c].g}</span></div><div class="main"><div class="route"><div>${r.v.o}</div><span class="line"></span><div>${r.v.d}</div></div><div class="kv"><div><span>Pasajero</span><b>${esc(p.n)} ${esc(p.a)}</b></div><div><span>Asiento</span><b>${p.s}</b></div><div><span>Puerta</span><b>${r.v.puerta} · Terminal ${r.v.term}</b></div><div><span>Embarque</span><b>${addMin(r.v.h,-40)}</b></div><div><span>Exceso</span><b>${p.ex?COP(p.ex):'Sin costo'}</b></div></div></div><div class="stub">${bars('PA'+r.cod+p.s)}</div></div>`).join('')+`<div class="actions"><button class="alt" onclick="window.print()">Imprimir pases</button></div>`}
 return h}
function buscarRes(){CI.cod=$('#rc').value.trim();CI.kg={};CI.msg=RES.some(x=>x.cod==CI.cod.toUpperCase())?'':'No encontramos esa reserva. Revisa el código e inténtalo de nuevo.';render()}
function hacerCI(c){const r=RES.find(x=>x.cod==c);r.pax.forEach((p,i)=>{const kg=CI.kg[i]??10;p.ex=Math.max(0,kg-CL[r.c].kg)*15000});r.ci=true;save();render()}

let TAB='vuelos',AMSG='';
function vAdmin(){const T={vuelos:['Código','Origen','Destino','Salida','Avión','Puerta','Estado',VUELOS.slice(0,40).map(v=>[v.cod,v.o,v.d,v.h,v.avion,v.puerta,v.estado])],
 flota:['Código','Modelo','Fabricante','Capacidad','Eco/Bus/Prim','Año','Estado',AVIONES.map(a=>[a.cod,a.mod,a.fab,a.cap,`${a.e}/${a.b}/${a.p}`,a.anio,a.estado])],
 tarifas:['Ruta','Clase','Precio base','Factor','Equipaje kg','Vigencia','Política',RUTAS.slice(0,7).flatMap(r=>Object.keys(CL).map(k=>[r[0]+'-'+r[1],CL[k].n,COP(r[2]),'×'+CL[k].f,CL[k].kg,'2026','Cambios con cargo']))],
 reservas:['Reserva','Ruta','Fecha','Pasajeros','Total','Pago','Estado',RES.map(r=>[r.cod,r.v.o+'-'+r.v.d,r.f,r.pax.length,COP(r.total),r.pago.m,r.estado])]};
 const t=T[TAB],hd=t.slice(0,7),rows=t[7];
 return`<h1 style="font-size:3rem">Administración</h1><div class="tabs" role="tablist">${Object.keys(T).map(k=>`<button class="${k==TAB?'on':''}" onclick="TAB='${k}';render()">${k[0].toUpperCase()+k.slice(1)}</button>`).join('')}</div>
 ${TAB=='vuelos'?`<div class="card" style="margin-bottom:1rem"><h3>Programar vuelo</h3><div class="grid cols" style="margin-top:.6rem"><div><label>Origen</label><select id="ao">${opts('BAQ')}</select></div><div><label>Destino</label><select id="ad">${opts('BOG')}</select></div><div><label>Hora</label><input id="ah" type="time" value="08:00"></div><div><label>Avión</label><select id="aa">${AVIONES.filter(a=>a.estado=='Operativo').map(a=>`<option>${a.cod}</option>`).join('')}</select></div></div><div class="actions"><button onclick="addVuelo()">Guardar vuelo</button></div>${AMSG}</div>`:''}
 <div class="card scroll"><table class="t"><thead><tr>${hd.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map((r,i)=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}${TAB=='reservas'&&r[6]=='Confirmada'?`<td><button class="alt" onclick="cancelar(${i})">Cancelar</button></td>`:''}</tr>`).join(''):`<tr><td colspan="7">Aún no hay reservas. Crea una desde la pestaña Reservar.</td></tr>`}</tbody></table></div>`}
function addVuelo(){const o=$('#ao').value,d=$('#ad').value;if(o==d){AMSG='<div class="msg bad">Origen y destino deben ser distintos.</div>';return render()}
 VUELOS.unshift({cod:'AV'+(900+VUELOS.length),o,d,h:$('#ah').value,dur:70,base:400000,avion:$('#aa').value,puerta:'A1',term:1,estado:'Programado'});AMSG='<div class="msg ok">Vuelo programado.</div>';render()}
function cancelar(i){RES[i].estado='Cancelada';save();render()}

let ADM='panel';
const TRIP=[{id:'T-01',n:'Laura Pineda',t:'Piloto',l:'ATPL-4410',h:5200,e:'Activo',v:'AV100'},{id:'T-02',n:'Carlos Mendoza',t:'Copiloto',l:'CPL-8832',h:2900,e:'Activo',v:'AV100'},{id:'T-03',n:'Marta Ruiz',t:'Auxiliar de cabina',l:'TCP-1207',h:3100,e:'Activo',v:'AV104'},{id:'T-04',n:'Esteban Arias',t:'Auxiliar de cabina',l:'TCP-1881',h:1800,e:'Descanso',v:''},{id:'T-05',n:'Diana Cortés',t:'Piloto',l:'ATPL-5521',h:6400,e:'Activo',v:'AV120'}];
const KIOS=[['DC-01','BAQ','Terminal 1 · Hall principal','Kiosco','Activo'],['DC-02','BAQ','Terminal 1 · Puerta A3','Lector de boletos','Activo'],['DC-03','BOG','Terminal 2 · Mostradores','Kiosco','Mantenimiento'],['DC-04','MDE','Terminal 1 · Hall','Kiosco','Activo']];

if(!RES.some(r=>r.demo)){
 const N=['Camila','Andrés','Sofía','Mateo','Valentina','Julián','Daniela','Santiago'],A=['Rojas','Pérez','Mora','Díaz','Ortiz','Vega','Castro','Ríos'];
 // [origen, destino, pasajeros, clase, fila del asiento]  → salen de varias ciudades
 [['BAQ','BOG',3,'E',7],['BAQ','MIA',2,'B',3],['MDE','MIA',3,'E',8],['MDE','PTY',2,'E',9],['CLO','MIA',2,'E',10],['CTG','SAP',2,'E',11],['BAQ','SAP',2,'E',6],['BAQ','SMR',3,'E',12],['BOG','MAD',1,'B',4],['BOG','JFK',2,'E',13],['MDE','CTG',3,'E',14],['BAQ','CLO',2,'E',7],['BAQ','PTY',2,'E',8],['BOG','PTY',2,'E',9]]
 .filter(([o,d])=>VUELOS.some(x=>x.o==o&&x.d==d))
 .forEach(([o,d,n,k,row],i)=>{const v=VUELOS.find(x=>x.o==o&&x.d==d),f='2026-12-'+String(3+i).padStart(2,'0');
  RES.push({demo:true,cod:'RS-D'+String(i+1).padStart(2,'0'),v,f,c:k,pax:Array.from({length:n},(_,j)=>({n:N[(i+j)%8],a:A[(i*2+j)%8],t:'CC',d:'10'+i+'4455'+j,s:row+'ABCDEF'[j],pr:price(v,k),ex:0})),mail:'demo@correo.com',total:n*price(v,k),pago:{m:['Tarjeta de crédito','PSE','Tarjeta débito'][i%3],cu:'3',ref:'TX'+i},estado:'Confirmada',ci:i==0})})}

  const PAX=()=>RES.flatMap(r=>r.pax.map(p=>({...p,r})));
const tbl=(hd,rows)=>`<div class="card scroll"><table class="t"><thead><tr>${hd.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${hd.length}">Sin registros todavía.</td></tr>`}</tbody></table></div>`;
const tag=(t,c)=>`<span class="tag ${c||''}">${t}</span>`;
const SEC=[['panel','Panel principal','Resumen de la operación'],['vuelo','Vuelo','Programa vuelos y actualiza su estado'],['reserva','Reserva','Consulta y cancela reservas'],['pasajero','Pasajero','Pasajeros registrados en reservas'],['check','Check-point y equipaje','Check-in, equipaje y kioscos'],['rep','Reportes','Indicadores para imprimir'],['rutas','Rutas y Tarifas','Rutas, frecuencias y precios por clase'],['trip','Tripulación','Personal de vuelo y asignaciones']];
function vAdm(){const s=SEC.find(x=>x[0]==ADM);let h='';
 if(ADM=='panel'){const act=RES.filter(r=>r.estado=='Confirmada'),ing=act.reduce((a,r)=>a+r.total,0),rt={};act.forEach(r=>{const k=r.v.o+'-'+r.v.d;rt[k]=(rt[k]||0)+r.total});const mx=Math.max(1,...Object.values(rt));
  h=`<div class="grid cols">${[['Vuelos programados',VUELOS.length],['Reservas activas',act.length],['Pasajeros',PAX().length],['Ingresos',COP(ing)],['Check-ins hechos',RES.filter(r=>r.ci).length],['Tripulantes',TRIP.length]].map(([a,b])=>`<div class="card kpi"><span>${a}</span><b>${b}</b></div>`).join('')}</div><h3 style="margin:1.4rem 0 .6rem">Ingresos por ruta</h3><div class="card">${Object.entries(rt).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([a,b])=>`<div class="hb"><span>${a}</span><i style="width:${b/mx*100}%"></i><em>${COP(b)}</em></div>`).join('')||'<p class="sub">Aún no hay ingresos para mostrar.</p>'}</div>`}
 if(ADM=='vuelo'){h=`<div class="card" style="margin-bottom:1rem"><h3>Programar vuelo</h3><div class="grid cols" style="margin-top:.6rem"><div><label for="ao">Origen</label><select id="ao">${opts('BAQ')}</select></div><div><label for="ad">Destino</label><select id="ad">${opts('BOG')}</select></div><div><label for="ah">Hora</label><input id="ah" type="time" value="08:00"></div><div><label for="aa">Avión</label><select id="aa">${AVIONES.filter(a=>a.estado=='Operativo').map(a=>`<option>${a.cod}</option>`).join('')}</select></div></div><div class="actions"><button onclick="addVuelo()">Guardar vuelo</button></div>${AMSG}</div>`+tbl(['Vuelo','Ruta','Salida','Llegada','Avión','Puerta','Estado'],VUELOS.slice(0,30).map((v,i)=>[v.cod,v.o+' a '+v.d,v.h,addMin(v.h,v.dur),v.avion,v.puerta+' · T'+v.term,`<select aria-label="Estado de ${v.cod}" onchange="VUELOS[${i}].estado=this.value">${['Programado','Abordando','En vuelo','Retrasado','Cancelado','Aterrizado'].map(e=>`<option${e==v.estado?' selected':''}>${e}</option>`).join('')}</select>`]))}
 if(ADM=='reserva')h=tbl(['Reserva','Ruta','Fecha','Clase','Pasajeros','Total','Pago','Estado',''],RES.map((r,i)=>[r.cod,r.v.o+' a '+r.v.d,fdate(r.f),CL[r.c].n,r.pax.length,COP(r.total),r.pago.m,tag(r.estado,r.estado=='Confirmada'?'ok':'bad'),r.estado=='Confirmada'?`<button class="alt" onclick="cancelar(${i})">Cancelar</button>`:'']));
 if(ADM=='pasajero')h=tbl(['Documento','Nombre','Reserva','Vuelo','Asiento','Millas'],PAX().map(p=>[esc(p.t)+' '+esc(p.d),esc(p.n)+' '+esc(p.a),p.r.cod,p.r.v.cod,p.s,Math.round(p.pr/1000)]));
 if(ADM=='check')h=tbl(['Reserva','Pasajero','Asiento','Puerta','Check-in','Exceso de equipaje'],PAX().map(p=>[p.r.cod,esc(p.n)+' '+esc(p.a),p.s,p.r.v.puerta,tag(p.r.ci?'Completado':'Pendiente',p.r.ci?'ok':''),p.ex?COP(p.ex):p.r.ci?'Sin costo':'—']))+'<h3 style="margin:1.4rem 0 .6rem">Dispositivos de check-in</h3>'+tbl(['Código','Aeropuerto','Ubicación','Tipo','Estado'],KIOS.map(k=>[k[0],k[1],k[2],k[3],tag(k[4],k[4]=='Activo'?'ok':'bad')]));
 if(ADM=='rutas')h=`<p class="sub">Cambia el precio base económico y se actualiza en todos los vuelos de la ruta.</p>`+tbl(['Ruta','Duración','Frecuencia semanal','Base económica','Business','Primera','Equipaje (E/B/P)'],RUTAS.map((r,i)=>['R-'+String(i+1).padStart(2,'0')+' · '+r[0]+' a '+r[1],r[3]+' min','28 vuelos',`<input type="number" min="0" step="10000" value="${r[2]}" aria-label="Precio base ${r[0]} a ${r[1]}" onchange="setBase(${i},this.value)">`,COP(r[2]*CL.B.f),COP(r[2]*CL.P.f),'23 / 32 / 40 kg']));
 if(ADM=='trip')h=tbl(['Código','Nombre','Cargo','Licencia','Horas de vuelo','Estado','Vuelo asignado','Salida'],TRIP.map((t,i)=>{const v=VUELOS.find(x=>x.cod==t.v);return[t.id,t.n,t.t,t.l,t.h.toLocaleString('es-CO'),tag(t.e,t.e=='Activo'?'ok':''),`<select aria-label="Vuelo de ${t.n}" onchange="TRIP[${i}].v=this.value;render()"><option value="">Sin asignar</option>${VUELOS.slice(0,30).map(x=>`<option${x.cod==t.v?' selected':''}>${x.cod}</option>`).join('')}</select>`,v?v.h+' · '+v.o+' a '+v.d:'—']}));
 if(ADM=='rep')h=vRep();
 return`<div class="adm"><aside class="side" aria-label="Secciones administrativas">${SEC.map(x=>`<button class="${x[0]==ADM?'on':''}" onclick="ADM='${x[0]}';render()">${x[1]}</button>`).join('')}</aside><section><h1 style="font-size:2.6rem">${s[1]}</h1><p class="sub">${s[2]}</p>${h}</section></div>`}
function pdfReportes(){const o0=$('#prev');if(o0)o0.remove();const f=new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'}),body=vRep().replace(/<div class="actions"[\s\S]*?<\/div><div class="po">[\s\S]*?<\/div>/,'');
 const o=document.createElement('div');o.id='prev';o.innerHTML=`<div class="pv-bar"><b>Vista previa del reporte</b><span><button onclick="imprimirPrev()">Imprimir / Guardar PDF</button><button class="alt" onclick="$('#prev').remove()">Cerrar</button></span></div><div class="pv-scroll"><article class="sheet"><div class="sh-h"><h2>AEROBOOK · Reporte de operación</h2><p>Generado el ${f}</p></div>${body}<h3 style="margin:1rem 0 .6rem">Detalle de reservas</h3>${tbl(['Reserva','Ruta','Fecha','Clase','Pasajeros','Total','Estado'],RES.map(r=>[r.cod,r.v.o+' a '+r.v.d,r.f,CL[r.c].n,r.pax.length,COP(r.total),r.estado]))}</article></div>`;document.body.appendChild(o);o.querySelector('button').focus()}
function imprimirPrev(){const t=document.title;document.title='Reportes AEROBOOK '+new Date().toISOString().slice(0,10);try{window.print()}catch(e){}document.title=t}
addEventListener('keydown',e=>{if(e.key=='Escape'&&$('#prev'))$('#prev').remove()});
function chart(t,d,f){f=f||(x=>x);const S=120,W=Math.max(340,d.length*S),H=220,mx=Math.max(1,...d.map(x=>x[1]));
 return`<div class="card" style="margin-bottom:1rem"><h3>${t}</h3>${d.length?`<div class="scroll"><svg viewBox="0 0 ${W} ${H+34}" width="${W}" height="${H+34}" role="img" aria-label="Gráfica: ${t}" style="max-width:none"><line x1="0" y1="${H}" x2="${W}" y2="${H}" style="stroke:var(--line)"/>${d.map((x,i)=>{const h=Math.max(3,x[1]/mx*(H-34)),cx=i*S+S/2;return`<rect x="${cx-26}" y="${H-h}" width="52" height="${h}" rx="4" style="fill:var(--accent)"/><text x="${cx}" y="${H-h-7}" text-anchor="middle" font-size="12" font-weight="600" style="fill:var(--ink)">${f(x[1])}</text><text x="${cx}" y="${H+20}" text-anchor="middle" font-size="12" style="fill:var(--muted)">${esc(x[0])}</text>`}).join('')}</svg></div>`:'<p class="sub">Sin datos todavía.</p>'}</div>`}
function vRep(){const act=RES.filter(r=>r.estado=='Confirmada'),agg=f=>{const m={};act.forEach(r=>f(r).forEach(([k,v])=>m[k]=(m[k]||0)+v));return Object.entries(m)},est={};
 RES.forEach(r=>est[r.estado]=(est[r.estado]||0)+1);
 const ex=PAX().reduce((a,p)=>a+(p.ex||0),0);
 return`<div class="actions" style="margin:0 0 1rem"><button onclick="pdfReportes()">Descargar PDF</button><span class="sub hint" style="margin:0;align-self:center">Se abre la vista previa del reporte para imprimir o guardar como PDF.</span></div><div class="po"><h2>AEROBOOK · Reporte de operación</h2><p>Generado el ${new Date().toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})}</p></div><div class="grid cols" style="margin-bottom:1rem">${[['Ingresos totales',COP(act.reduce((a,r)=>a+r.total,0))],['Reservas confirmadas',act.length],['Check-ins completados',RES.filter(r=>r.ci).length],['Cobros por exceso',COP(ex)]].map(([a,b])=>`<div class="card kpi"><span>${a}</span><b>${b}</b></div>`).join('')}</div>`
 +chart('Ingresos por ruta (COP)',agg(r=>[[r.v.o+'-'+r.v.d,r.total]]),COP)
 +chart('Ingresos por método de pago (COP)',agg(r=>[[r.pago.m,r.total]]),COP)
 +chart('Pasajeros por clase',agg(r=>[[CL[r.c].n,r.pax.length]]))
 +chart('Pasajeros por vuelo',agg(r=>[[r.v.cod,r.pax.length]]))
 +chart('Reservas por estado',Object.entries(est))}
function setBase(i,v){RUTAS[i][2]=+v||0;VUELOS.forEach(x=>{if(x.o==RUTAS[i][0]&&x.d==RUTAS[i][1])x.base=+v||0});render()}
function render(){const v=(location.hash||'#reservar').slice(1);$('#area').textContent=v=='admin'||v=='reportes'?'Área administrativa':'Área usuario';
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.v==v));
 $('#app').innerHTML=v=='reportes'?`<h1 style="font-size:3rem">Reportes</h1><p class="sub">Indicadores para imprimir</p>`+vRep():v=='checkin'?vCheckin():v=='admin'?vAdm():vReservar()}
(function(){const P=new URLSearchParams(location.search),o=P.get('o'),d=P.get('d');
 if(CIU[o]&&CIU[d]&&o!=d){S.q.o=o;S.q.d=d;if(/^\d{4}-\d{2}-\d{2}$/.test(P.get('f'))&&P.get('f')>=HOY)S.q.f=P.get('f');S.q.n=Math.min(6,Math.max(1,+P.get('n')||1))}})();
addEventListener('hashchange',()=>{render();scrollTo(0,0)});render();
