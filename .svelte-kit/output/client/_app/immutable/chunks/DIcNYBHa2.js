import{i as e}from"./DXrdfDtZ.js";function t(e){let t=/^(?:(\d{1,2}):)?(\d{2}):(\d{2})[.,](\d{3})$/.exec(e.trim());return t?`${(t[1]??`0`).padStart(2,`0`)}:${t[2]}:${t[3]},${t[4]}`:e.trim().replace(`.`,`,`)}function n(e){return`WEBVTT

`+e.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g,`$1.$2`).trim()+`
`}function r(e){let n=e.split(/\n{2,}/).map(e=>e.trim()).filter(e=>e&&!e.startsWith(`WEBVTT`)&&!e.startsWith(`NOTE`)&&!e.startsWith(`STYLE`)&&!e.startsWith(`REGION`)),r=[];for(let e of n){let n=e.split(`
`),i=n.findIndex(e=>e.includes(`-->`));if(i<0)continue;let[a,o]=n[i].split(`-->`);if(!o)continue;let s=o.trim().split(/\s+/)[0],c=n.slice(i+1).join(`
`).replace(/<\/?[cv][^>]*>/g,``);r.push(`${r.length+1}\n${t(a)} --> ${t(s)}\n${c}`)}if(!r.length)throw Error(`no subtitle cues found`);return r.join(`

`)+`
`}async function i(t,i,a){let o=[];for(let i=0;i<t.length;i++){let s=t[i];a({ratio:i/t.length,label:`rewriting ${s.name} (${i+1}/${t.length})`});let c=(await s.text()).replace(/^﻿/,``).replace(/\r\n?/g,`
`),l=/\.vtt$/i.test(s.name)||c.trimStart().startsWith(`WEBVTT`),u=l?r(c):n(c);o.push({name:e(s.name,l?`srt`:`vtt`),blob:new Blob([u],{type:`text/plain`}),from:s.name})}return a({ratio:1}),o}export{i as convertSubs};