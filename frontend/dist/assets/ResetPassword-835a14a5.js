import{u as F,k as V,a as N,r as w,b as S,o as t,c as l,w as p,d as e,e as r,_ as $,h as f,g as y,t as x,f as o,j,F as g,E as v,i as z}from"./index-8f2d3d2e.js";import{_ as E}from"./AuthLayout-349c8c2b.js";import{t as M,o as T,s as h}from"./vee-validate-zod-0b684b67.js";import{r as k,a as _}from"./EyeIcon-54d2a192.js";const Y={class:"bg-white p-8 rounded-lg shadow-lg max-w-md w-full"},D={class:"flex justify-center mb-6"},Z={key:0,class:"mb-6 p-4 bg-green-50 border border-green-200 text-green-600 rounded-md"},q={class:"mt-4 text-center"},H={class:"space-y-4"},G={class:"relative"},I={class:"relative"},J={key:0,class:"bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative",role:"alert"},K={class:"block sm:inline"},L=["disabled"],O={key:0},Q={key:1},te={__name:"ResetPassword",setup(U){F();const P=V(),C=N(),a=w(""),b=w(""),c=w(!1),m=w(!1),A=M(T({password:h().min(8,"Password must be at least 8 characters").regex(/[A-Z]/,"Password must contain at least one uppercase letter").regex(/[a-z]/,"Password must contain at least one lowercase letter").regex(/[0-9]/,"Password must contain at least one number").regex(/[^A-Za-z0-9]/,"Password must contain at least one special character"),confirmPassword:h().min(1,"Please confirm your password")}).refine(n=>n.password===n.confirmPassword,{message:"Passwords don't match",path:["confirmPassword"]})),R=async n=>{var s,d;try{a.value="";const i=P.query.token;if(!i){a.value="Reset token is missing";return}const u=await C.resetPassword({token:i,password:n.password});u.status==="success"?b.value="Your password has been reset successfully. You can now login with your new password.":a.value=u.message||"Failed to reset password"}catch(i){a.value=((d=(s=i.response)==null?void 0:s.data)==null?void 0:d.message)||"Failed to reset password"}};return(n,s)=>{const d=S("router-link");return t(),l(E,null,{default:p(()=>[e("div",Y,[e("div",D,[r(d,{to:{name:"home"},class:"inline-block w-20 h-20"},{default:p(()=>[r($,{isDark:!1})]),_:1})]),s[7]||(s[7]=e("h2",{class:"text-2xl font-bold mb-2 text-center text-gray-900"}," Reset Your Password ",-1)),s[8]||(s[8]=e("p",{class:"text-gray-600 text-center mb-6"}," Please enter your new password below. ",-1)),b.value?(t(),f("div",Z,[y(x(b.value)+" ",1),e("div",q,[r(d,{to:{name:"login"},class:"font-medium text-blue-600 hover:text-blue-500"},{default:p(()=>s[2]||(s[2]=[y(" Back to login ")])),_:1})])])):(t(),l(o(j),{key:1,"validation-schema":o(A),onSubmit:R},{default:p(({errors:i,isSubmitting:u})=>[e("div",H,[e("div",null,[s[3]||(s[3]=e("label",{for:"password",class:"block text-sm font-medium mb-1 text-gray-700"}," New Password ",-1)),e("div",G,[r(o(g),{type:c.value?"text":"password",id:"password",name:"password",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"Enter your new password"},null,8,["type"]),e("button",{type:"button",onClick:s[0]||(s[0]=B=>c.value=!c.value),class:"absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"},[c.value?(t(),l(o(_),{key:1,class:"h-5 w-5"})):(t(),l(o(k),{key:0,class:"h-5 w-5"}))])]),r(o(v),{name:"password",class:"mt-1 text-sm text-red-500"})]),e("div",null,[s[4]||(s[4]=e("label",{for:"confirmPassword",class:"block text-sm font-medium mb-1 text-gray-700"}," Confirm Password ",-1)),e("div",I,[r(o(g),{type:m.value?"text":"password",id:"confirmPassword",name:"confirmPassword",class:"w-full px-4 py-2 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500",placeholder:"Confirm your new password"},null,8,["type"]),e("button",{type:"button",onClick:s[1]||(s[1]=B=>m.value=!m.value),class:"absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"},[m.value?(t(),l(o(_),{key:1,class:"h-5 w-5"})):(t(),l(o(k),{key:0,class:"h-5 w-5"}))])]),r(o(v),{name:"confirmPassword",class:"mt-1 text-sm text-red-500"})]),s[6]||(s[6]=e("div",{class:"text-sm text-gray-600 space-y-1"},[e("p",{class:"font-medium"},"Password must contain:"),e("ul",{class:"list-disc list-inside space-y-1"},[e("li",null,"At least 8 characters"),e("li",null,"At least one uppercase letter"),e("li",null,"At least one lowercase letter"),e("li",null,"At least one number"),e("li",null,"At least one special character")])],-1)),a.value?(t(),f("div",J,[e("span",K,x(a.value),1)])):z("",!0),e("button",{type:"submit",disabled:u,class:"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"},[u?(t(),f("span",O,s[5]||(s[5]=[e("svg",{class:"animate-spin -ml-1 mr-3 h-5 w-5 text-white",xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24"},[e("circle",{class:"opacity-25",cx:"12",cy:"12",r:"10",stroke:"currentColor","stroke-width":"4"}),e("path",{class:"opacity-75",fill:"currentColor",d:"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"})],-1),y(" Resetting... ")]))):(t(),f("span",Q,"Reset Password"))],8,L)])]),_:1},8,["validation-schema"]))])]),_:1})}}};export{te as default};