[返回專案文件索引](README.md)

<a name="dm-top"></a>
# DM 文件
## 摘要
AAE服務為透過ICE(Interactive Connectivity Establishment)協定達成點對點傳輸功能, 用以提供資料, 語音及視訊傳輸的功能。本文件將提供**流程簡述**, **Web Service API**, **SDK API** 等資訊。

## 流程簡述
下圖描述端點建立過程與不同伺服器間以及端點間溝通的主要步驟, 步驟 1-8, 包含於 Web Service API 中. 步驟9-10則包含於SDK API中。

![image](https://user-images.githubusercontent.com/45666044/263954980-af01f23b-065a-410b-a483-9349cb77cd34.png)

## 網路服務 API (Web Service)
### 名詞解釋
   -  userid: 用來登入ASUS VIP Service 的帳碼號名稱
   -  passwd: 用來登入 ASUS VIP Service 的密碼
   -  cusid: ASUS VIP Service 分配的唯一辨識碼
   -  userticket: 用來登入 ASUS VIP Service 取得資訊的臨時密碼
   -  devicemd5mac: Relay Service 針對每個設備的唯一 ID
   -  deviceid: Relay Service 針對每個設備分配的唯一辨識碼
   -  deviceticket: 用來登入 Service Unit 取得設備相關資料的臨時密碼
   -  UA: User Agent, 在此系統中代表的是透過某個 ASUS ID 註冊登入的某一個設備
   -  Service Portal: 用來分配使用者使用的 Service Area 的伺服器
   -  Service Area: 提供使用者服務的區域
   -  Service Unit: 提供使用者服務區域中的 Server
   -  SID: 用來辨別應用程式的 ID(請參照[附件](#dm-attachment_sid))
### API清單
   -  瀏覽步驟說明
      1. 開啟 [Swagger Editor](https://editor.swagger.io/) 或者編輯器有下載swagger viewer extention也可以
      2. 前往[api-reference.yaml](api-reference.yaml)
      3. 將上述連結的文字貼到Swagger Editor則可以檢視
### API補充說明
   -  新舊版Account binding差異比較
      1. 新版
         - 流程圖
           ![image](https://user-images.githubusercontent.com/45666044/264249700-65138cc7-60e3-43b9-b30d-9d6986b475e4.png)
         - 說明
           1. 首先我們會透過asus vip或者其他第三方登入, 取得一組 **userid**及**passwd**
           2. 接著, 我們會call **/aae/getservicearea**去取得將要去哪個伺服器進行後續的服務
           3. app call **/aae/login**進行登入, 將取得 **cusid, userticket, userrefreshticket, deviceticket, deviceid**等重要參數
           4. 使用剛剛login取得的 **cusid, userrefreshticket**搭配手機的**deviceMd5Mac**去call **/aae/getuserticketbyrefresh**要一組新的userticket回來給app(**ASUS Router**)使用, 底下我們簡稱**app userticket**
           5. 再來, 我們需要去幫router取得一組refreshticket我們簡稱**routerrefreshticket**, 主要是帶著**cusid, deviceMd5Mac, app userticket**透過call **/aae/getuserrefreshticket**去取得
           6. 接著app會幫router去申請**userticket**我們簡稱**routeruserticket**, 主要是帶著**cusid, routerMd5Mac, routerrefreshticket**透過call **/aae/getuserticketbyrefresht**去取得, 這邊補充因為有新舊版fw的關係, 所以該步驟如果是舊版fw則**routerMd5Mac**需要帶空值
           7. 接著, 我們會透過app把**cusid, routeruserticket, routerrefreshticket**傳給fw, 這邊補充因為有新舊版fw的關係, 所以該步驟如果是舊版fw則**routerrefreshticket**需要加prefix**old_**
           8. 最後fw帶著 **cusid, routerrefreshticket, routeruserticket, routerMd5Mac**等參數進行login, 取得**deviceid, deviceticket**等重要參數
          > 這邊要說明一下，為什麼也要幫舊版的FW申請新版的userrefreshticket，並帶過去的原因，是為了讓FW升級以後，FW可以順利的使用該userrefreshticket取得新版userticket，繼續跟DM溝通運做
      2. 舊版
         - 流程圖
           ![image](https://user-images.githubusercontent.com/45666044/264257463-ad49e0d5-e253-41ed-a6fe-7b836d15aada.png)
         - 說明
           1. 首先我們會透過asus vip或者其他第三方登入, 取得一組 **userid**及**passwd**
           2. 接著, 我們會call **/aae/getservicearea**去取得將要去哪個伺服器進行後續的服務
           3. app call **/aae/login**進行登入, 將取得 **cusid, userticket, userrefreshticket, deviceticket, deviceid**等重要參數
           4. 接著, 我們會透過app把**cusid, userticket**傳給fw
           5. 最後fw帶著 **cusid, userticket, routerMd5Mac**等參數進行login, 取得**deviceid, deviceticket**等重要參數
      > 從新舊版比較可以得知我們在進行login的時候, 新版因為會透過/getuserrefreshticket及/getuserticketbyrefresh取得自己專屬router的userticket及userrefreshticket進行登入, 所以之後如果客戶將router轉售給其他人, 我們系統仍可以針對router的權限進行管控

## 附件
### Event Code
|     Event   Code    |     Code   Name                          |     Description                                                 |
|---------------------|------------------------------------------|-----------------------------------------------------------------|
|     0               |     NATNL_INV_EVENT_NULL                 |     Null   state (SIP call state)                               |
|     1               |     NATNL_INV_EVENT_CALLING              |     Calling   state (SIP call state)                            |
|     2               |     NATNL_INV_EVENT_INCOMING             |     Got   incoming call (SIP call state)                        |
|     3               |     NATNL_INV_EVENT_EARLY                |     Sip   call early state (SIP call state)                     |
|     4               |     NATNL_INV_EVENT_CONNECTING           |     Connecting   state (SIP call state)                         |
|     5               |     NATNL_INV_EVENT_CONFIRMED            |     Call   already made (SIP call state)                        |
|     6               |     NATNL_INV_EVENT_DISCONNECTED         |     Call   hangup (SIP call state)                              |
|     60000           |     NATNL_SIP_EVENT_REG                  |     Device   registered                                         |
|     60001           |     NATNL_SIP_EVENT_UNREG                |     Device   unregistered                                       |
|     60002           |     NATNL_TNL_STUN_EVENT_KA_TIMEOUT      |     Tunnel   timed out to send keep alive packet                |
|     60003           |     NATNL_TNL_EVENT_START                |     Tunnel   already built                                      |
|     60004           |     NATNL_TNL_EVENT_STOP                 |     Tunnel   already terminated                                 |
|     60005           |     NATNL_TNL_EVENT_NAT_TYPE_DETECTED    |     SDK   detected nat type (since v1.1.0.6)                    |
|     60100           |     NATNL_TNL_EVENT_INIT_OK              |     init   successfully (since v1.1.0.11)                       |
|     60101           |     NATNL_TNL_EVENT_INIT_FAILED          |     init   failed (since v1.1.0.11)                             |
|     60102           |     NATNL_TNL_EVENT_DEINIT_OK            |     De-initialize   successfully (since v1.1.0.11)              |
|     60103           |     NATNL_TNL_EVENT_DEINIT_FAILED        |     De-initialize   failed (since v1.1.0.11)                    |
|     60104           |     NATNL_TNL_EVENT_MAKECALL_OK          |     Make   call successfully (since v1.1.0.11)                  |
|     60105           |     NATNL_TNL_EVENT_MAKECALL_FAILED      |     Make   call failed (since v1.1.0.11)                        |
|     60106           |     NATNL_TNL_EVENT_HANGUP_OK            |     Hang   up successfully (since v1.1.0.11)                    |
|     60107           |     NATNL_TNL_EVENT_HANGUP_FAILED        |     Hang   up failed (since v1.1.0.11)                          |
|     60108           |     NATNL_TNL_EVENT_IP_CHANGED           |     IP   changed (since v1.2.8.0)                               |
|     60109           |     NATNL_TNL_EVENT_REG_OK               |     Register   successfully (since v1.3.2.0)                    |
|     60110           |     NATNL_TNL_EVENT_REG_FAILED           |     Register   failed (since v1.3.2.0)                          |
|     60111           |     NATNL_TNL_EVENT_UNREG_OK             |     Un-register   successfully (since v1.3.2.0)                 |
|     60112           |     NATNL_TNL_EVENT_UNREG_FAILED         |     Un-register   failed (since v1.3.2.0)                       |
|     60113           |     NATNL_TNL_EVENT_IDLE_TIMEOUT         |     Idle   timeout (since v1.7.0.0)                             |
|     60114           |     NATNL_TNL_EVENT_DEADLOCK             |     SDK   deadlock. APP should restart the program (2.0.0.6)    |
### Status Code
   -  無類別

|     Status   Code    |     Code   Name                    |     Description                                                   |
|----------------------|------------------------------------|-------------------------------------------------------------------|
|     404              |     PJSIP_SC_NOT_FOUND             |     "The   remote device is not online"                           |
|     408              |     PJSIP_SC_REQUEST_TIMEOUT       |     "Request   timeout"                                           |
|     477              |     Send   Failed                  |     "Message   send failed, the remote device is just offline"    |
|     486              |     PJSIP_SC_BUSY_HERE             |     "The   maximum number of tunnel of remote device is full"     |
|     487              |     PJSIP_SC_REQUEST_TERMINATED    |     "Make   call session is terminated by remote device"          |
|     70001            |     PJ_EUNKNOWN                    |     "Unknown   Error"                                             |
|     70002            |     PJ_EPENDING                    |     "Pending   operation"                                         |
|     70003            |     PJ_ETOOMANYCONN                |     "Too   many connecting sockets"                               |
|     70004            |     PJ_EINVAL                      |     "Invalid   value or argument"                                 |
|     70005            |     PJ_ENAMETOOLONG                |     "Name   too long"                                             |
|     70006            |     PJ_ENOTFOUND                   |     "Not   found"                                                 |
|     70007            |     PJ_ENOMEM                      |     "Not   enough memory"                                         |
|     70008            |     PJ_EBUG                        |     "BUG   DETECTED!"                                             |
|     70009            |     PJ_ETIMEDOUT                   |     "Operation   timed out"                                       |
|     70010            |     PJ_ETOOMANY                    |     "Too   many objects of the specified type"                    |
|     70011            |     PJ_EBUSY                       |     "Object   is busy"                                            |
|     70012            |     PJ_ENOTSUP                     |     "Option/operation   is not supported"                         |
|     70013            |     PJ_EINVALIDOP                  |     "Invalid   operation"                                         |
|     70014            |     PJ_ECANCELLED                  |     "Operation   cancelled"                                       |
|     70015            |     PJ_EEXISTS                     |     "Object   already exists"                                     |
|     70016            |     PJ_EEOF                        |     "End   of file"                                               |
|     70017            |     PJ_ETOOBIG                     |     "Size   is too big"                                           |
|     70018            |     PJ_ERESOLVE                    |     "gethostbyname(   has returned error"                         |
|     70019            |     PJ_ETOOSMALL                   |     "Size   is too short"                                         |
|     70020            |     PJ_EIGNORED                    |     "Ignored"                                                     |
|     70021            |     PJ_EIPV6NOTSUP                 |     "IPv6   is not supported"                                     |
|     70022            |     PJ_EAFNOTSUP                   |     "Unsupported   address family"                                |
   -  PJSIP Specific Errors

|     Status   Code    |     Code   Name                 |     Description                                                                                                                                 |
|----------------------|---------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
|     171001           |     PJSIP_EBUSY                 |     "SIP   object is busy"                                                                                                                      |
|     171002           |     PJSIP_ETYPEEXISTS           |     "SIP   object with the same type already exists"                                                                                            |
|     171003           |     PJSIP_ESHUTDOWN             |     "SIP   stack is shutting down"                                                                                                              |
|     171004           |     PJSIP_ENOTINITIALIZED       |     "SIP object is not   initialized"                                                                                                           |
|     171005           |     PJSIP_ENOROUTESET           |     "Missing route set   (for tel: URI)"                                                                                                        |
|     171020           |     PJSIP_EINVALIDMSG           |     "General invalid   message error (e.g. syntax error)"                                                                                       |
|     171021           |     PJSIP_ENOTREQUESTMSG        |     "Expecting request   message"                                                                                                               |
|     171022           |     PJSIP_ENOTRESPONSEMSG       |     "Expecting response   message"                                                                                                              |
|     171023           |     PJSIP_EMSGTOOLONG           |     "Message too long.   See also PJSIP_ERXOVERFLOW"                                                                                            |
|     171024           |     PJSIP_EPARTIALMSG           |     "Message not   completely received"                                                                                                         |
|     171030           |     PJSIP_EINVALIDSTATUS        |     "Status code is   invalid"                                                                                                                  |
|     171039           |     PJSIP_EINVALIDURI           |     "General Invalid URI   error"                                                                                                               |
|     171040           |     PJSIP_EINVALIDSCHEME        |     "Unsupported URL   scheme"                                                                                                                  |
|     171041           |     PJSIP_EMISSINGREQURI        |     "Missing   Request-URI"                                                                                                                     |
|     171042           |     PJSIP_EINVALIDREQURI        |     "Invalid request   URI"                                                                                                                     |
|     171043           |     PJSIP_EURITOOLONG           |     "URI is too   long"                                                                                                                         |
|     171050           |     PJSIP_EMISSINGHDR           |     "Missing required   header(s)"                                                                                                              |
|     171051           |     PJSIP_EINVALIDHDR           |     "Invalid header   field"                                                                                                                    |
|     171052           |     PJSIP_EINVALIDVIA           |     "Invalid Via header   in response (sent-by, etc)"                                                                                           |
|     171053           |     PJSIP_EMULTIPLEVIA          |     "Multiple Via   headers in response"                                                                                                        |
|     171054           |     PJSIP_EMISSINGBODY          |     "Missing message   body"                                                                                                                    |
|     171055           |     PJSIP_EINVALIDMETHOD        |     "Invalid/unexpected   method"                                                                                                               |
|     171060           |     PJSIP_EUNSUPTRANSPORT       |     "Unsupported   transport type"                                                                                                              |
|     171061           |     PJSIP_EPENDINGTX            |     "Buffer is being   sent, operation still pending"                                                                                           |
|     171062           |     PJSIP_ERXOVERFLOW           |     "Rx buffer overflow.   See also PJSIP_EMSGTOOLONG"                                                                                          |
|     171063           |     PJSIP_EBUFDESTROYED         |     "This is not really   an error, it just informs application that  transmit data has been   deleted on return of pjsip_tx_data_dec_ref()"    |
|     171064           |     PJSIP_ETPNOTSUITABLE        |     "Unsuitable   transport selected"                                                                                                           |
|     171065           |     PJSIP_ETPNOTAVAIL           |     "Transport not   available"                                                                                                                 |
|     171070           |     PJSIP_ETSXDESTROYED         |     "Transaction has   just been destroyed"                                                                                                     |
|     171071           |     PJSIP_ENOTSX                |     "No   transaction"                                                                                                                          |
|     171080           |     PJSIP_ECMPSCHEME            |     "Scheme   mismatch"                                                                                                                         |
|     171081           |     PJSIP_ECMPUSER              |     "User part   mismatch"                                                                                                                      |
|     171082           |     PJSIP_ECMPPASSWD            |     "Password part   mismatch"                                                                                                                  |
|     171083           |     PJSIP_ECMPHOST              |     "Host part mismatch"                                                                                                                        |
|     171084           |     PJSIP_ECMPPORT              |     "Port part   mismatch"                                                                                                                      |
|     171085           |     PJSIP_ECMPTRANSPORTPRM      |     "Transport parameter   part mismatch"                                                                                                       |
|     171086           |     PJSIP_ECMPTTLPARAM          |     "TTL parameter part   mismatch"                                                                                                             |
|     171087           |     PJSIP_ECMPUSERPARAM         |     "User parameter part   mismatch"                                                                                                            |
|     171088           |     PJSIP_ECMPMETHODPARAM       |     "Method parameter   part mismatch"                                                                                                          |
|     171089           |     PJSIP_ECMPMADDRPARAM        |     "Maddr parameter   part mismatch"                                                                                                           |
|     171090           |     PJSIP_ECMPOTHERPARAM        |     "Parameter part in   other_param mismatch"                                                                                                  |
|     171091           |     PJSIP_ECMPHEADERPARAM       |     "Parameter part in   header_param mismatch"                                                                                                 |
|     171100           |     PJSIP_EFAILEDCREDENTIAL     |     "Credential failed   to authenticate"                                                                                                       |
|     171101           |     PJSIP_ENOCREDENTIAL         |     "No suitable   credential is found"                                                                                                         |
|     171102           |     PJSIP_EINVALIDALGORITHM     |     "Invalid/unsupported   algorithm"                                                                                                           |
|     171103           |     PJSIP_EINVALIDQOP           |     "Invalid/unsupported   qop"                                                                                                                 |
|     171104           |     PJSIP_EINVALIDAUTHSCHEME    |     "Invalid/unsupported   authentication scheme"                                                                                               |
|     171105           |     PJSIP_EAUTHNOPREVCHAL       |     "No previous   challenge"                                                                                                                   |
|     171106           |     PJSIP_EAUTHNOAUTH           |     "No authorization is   found"                                                                                                               |
|     171107           |     PJSIP_EAUTHACCNOTFOUND      |     "Account not   found"                                                                                                                       |
|     171108           |     PJSIP_EAUTHACCDISABLED      |     "Account is disabled"                                                                                                                       |
|     171109           |     PJSIP_EAUTHINVALIDREALM     |     "Invalid realm"                                                                                                                             |
|     171110           |     PJSIP_EAUTHINVALIDDIGEST    |     "Invalid   digest"                                                                                                                          |
|     171111           |     PJSIP_EAUTHSTALECOUNT       |     "Maximum number of   stale retries exceeded"                                                                                                |
|     171112           |     PJSIP_EAUTHINNONCE          |     "Invalid nonce value   in the challenge"                                                                                                    |
|     171113           |     PJSIP_EAUTHINAKACRED        |     "Invalid AKA   credential"                                                                                                                  |
|     171114           |     PJSIP_EAUTHNOCHAL           |     "No challenge is   found in the challenge"                                                                                                  |
|     171120           |     PJSIP_EMISSINGTAG           |     "Missing From/To   tag"                                                                                                                     |
|     171121           |     PJSIP_ENOTREFER             |     "Expecting REFER   method"                                                                                                                  |
|     171122           |     PJSIP_ENOREFERSESSION       |     "Not associated with   REFER subscription"                                                                                                  |
|     171140           |     PJSIP_ESESSIONTERMINATED    |     "Session already   terminated"                                                                                                              |
|     171141           |     PJSIP_ESESSIONSTATE         |     "Invalid session   state for the specified operation"                                                                                       |
|     171142           |     PJSIP_ESESSIONINSECURE      |     "The feature being   requested requires the use of secure session or transport"                                                             |
|     171160           |     PJSIP_TLS_EUNKNOWN          |     "Unknown TLS   error"                                                                                                                       |
|     171161           |     PJSIP_TLS_EINVMETHOD        |     "Invalid SSL   protocol method"                                                                                                             |
|     171162           |     PJSIP_TLS_ECACERT           |     "Error   loading/verifying SSL CA list file"                                                                                                |
|     171163           |     PJSIP_TLS_ECERTFILE         |     "Error loading SSL   certificate chain file"                                                                                                |
|     171164           |     PJSIP_TLS_EKEYFILE          |     "Error adding   private key from SSL certificate file"                                                                                      |
|     171165           |     PJSIP_TLS_ECIPHER           |     "Error setting SSL   cipher list"                                                                                                           |
|     171166           |     PJSIP_TLS_ECTX              |     "Error creating SSL   context"                                                                                                              |
|     171167           |     PJSIP_TLS_ESSLCONN          |     "Error creating SSL   connection object"                                                                                                    |
|     171168           |     PJSIP_TLS_ECONNECT          |     "Unknown error when   performing SSL connect()"                                                                                             |
|     171169           |     PJSIP_TLS_EACCEPT           |     "Unknown error when   performing SSL accept()"                                                                                              |
|     171170           |     PJSIP_TLS_ESEND             |     "Unknown error when   sending SSL data"                                                                                                     |
|     171171           |     PJSIP_TLS_EREAD             |     "Unknown error when   reading SSL data"                                                                                                     |
|     171172           |     PJSIP_TLS_ETIMEDOUT         |     "SSL negotiation has   exceeded the maximum configured timeout"                                                                             |
|     171173           |     PJSIP_TLS_ECERTVERIF        |     "SSL certificate   verification error"                                                                                                      |

   -  Generic PJMEDIA errors shouldn't be used

|     Status   Code    |     Code   Name      |     Description                      |
|----------------------|----------------------|--------------------------------------|
|     220001           |     PJMEDIA_ERROR    |     "Unspecified   PJMEDIA error"    |

   -  SDP error

|     Status   Code    |     Code   Name                    |     Description                                        |
|----------------------|------------------------------------|--------------------------------------------------------|
|     220020           |     PJMEDIA_SDP_EINSDP             |     "Invalid   SDP descriptor"                         |
|     220021           |     PJMEDIA_SDP_EINVER             |     "Invalid   SDP version line"                       |
|     220022           |     PJMEDIA_SDP_EINORIGIN          |     "Invalid   SDP origin line"                        |
|     220023           |     PJMEDIA_SDP_EINTIME            |     "Invalid   SDP time line"                          |
|     220024           |     PJMEDIA_SDP_EINNAME            |     "SDP   name/subject line is empty"                 |
|     220025           |     PJMEDIA_SDP_EINCONN            |     "Invalid   SDP connection line"                    |
|     220026           |     PJMEDIA_SDP_EMISSINGCONN       |     "Missing   SDP connection info line"               |
|     220027           |     PJMEDIA_SDP_EINATTR            |     "Invalid   SDP attributes"                         |
|     220028           |     PJMEDIA_SDP_EINRTPMAP          |     "Invalid   SDP rtpmap attribute"                   |
|     220029           |     PJMEDIA_SDP_ERTPMAPTOOLONG     |     "SDP   rtpmap attribute too long"                  |
|     220030           |     PJMEDIA_SDP_EMISSINGRTPMAP     |     "Missing   SDP rtpmap for dynamic payload type"    |
|     220031           |     PJMEDIA_SDP_EINMEDIA           |     "Invalid   SDP media line"                         |
|     220032           |     PJMEDIA_SDP_ENOFMT             |     "No   SDP payload format in the media line"        |
|     220033           |     PJMEDIA_SDP_EINPT              |     "Invalid   SDP payload type in media line"         |
|     220034           |     PJMEDIA_SDP_EINFMTP            |     "Invalid   SDP fmtp attribute"                     |
|     220035           |     PJMEDIA_SDP_EINRTCP            |     "Invalid   SDP rtcp attribyte"                     |
|     220036           |     PJMEDIA_SDP_EINPROTO           |     "Invalid   SDP media transport protocol"           |

   -  SDP negotiator errors

|     Status   Code    |     Code   Name                     |     Description                                            |
|----------------------|-------------------------------------|------------------------------------------------------------|
|     220040           |     PJMEDIA_SDPNEG_EINSTATE         |     Invalid   SDP negotiator state for operation           |
|     220041           |     PJMEDIA_SDPNEG_ENOINITIAL       |     No   initial local SDP in SDP negotiator               |
|     220042           |     PJMEDIA_SDPNEG_ENOACTIVE        |     No   active SDP in SDP negotiator                      |
|     220043           |     PJMEDIA_SDPNEG_ENONEG           |     No   current local/remote offer/answer                 |
|     220044           |     PJMEDIA_SDPNEG_EMISMEDIA        |     SDP   media count mismatch in offer/answer             |
|     220045           |     PJMEDIA_SDPNEG_EINVANSMEDIA     |     SDP   media type mismatch in offer/answer              |
|     220046           |     PJMEDIA_SDPNEG_EINVANSTP        |     SDP   media transport type mismatch in offer/answer    |
|     220047           |     PJMEDIA_SDPNEG_EANSNOMEDIA      |     No   common SDP media payload in answer                |
|     220048           |     PJMEDIA_SDPNEG_ENOMEDIA         |     No   active media stream after negotiation             |
|     220049           |     PJMEDIA_SDPNEG_NOANSCODEC       |     No   suitable codec for remote offer                   |
|     220050           |     PJMEDIA_SDPNEG_NOANSTELEVENT    |     No   suitable telephone-event for remote offer         |
|     220051           |     PJMEDIA_SDPNEG_NOANSUNKNOWN     |     No   suitable answer for unknown remote offer          |

   -  SDP comparison results

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     220060                                   |     PJMEDIA_SDP_EMEDIANOTEQUAL                |     "SDP   media descriptor not equal"                                                                         |
|     220061                                   |     PJMEDIA_SDP_EPORTNOTEQUAL                 |     "Port   in SDP media descriptor not equal"                                                                 |
|     220062                                   |     PJMEDIA_SDP_ETPORTNOTEQUAL                |     "Transport   in SDP media descriptor not equal"                                                            |
|     220063                                   |     PJMEDIA_SDP_EFORMATNOTEQUAL               |     "Format   in SDP media descriptor not equal"                                                               |
|     220064                                   |     PJMEDIA_SDP_ECONNNOTEQUAL                 |     "SDP   connection line not equal"                                                                          |
|     220065                                   |     PJMEDIA_SDP_EATTRNOTEQUAL                 |     "SDP   attributes not equal"                                                                               |
|     220066                                   |     PJMEDIA_SDP_EDIRNOTEQUAL                  |     "SDP   media direction not equal"                                                                          |
|     220067                                   |     PJMEDIA_SDP_EFMTPNOTEQUAL                 |     "SDP   fmtp attribute not equal"                                                                           |
|     220068                                   |     PJMEDIA_SDP_ERTPMAPNOTEQUAL               |     "SDP   rtpmap attribute not equal"                                                                         |
|     220069                                   |     PJMEDIA_SDP_ESESSNOTEQUAL                 |      "SDP session descriptor not equal"                                                                        |
|     220070                                   |     PJMEDIA_SDP_EORIGINNOTEQUAL               |     "SDP   origin line not equal"                                                                              |
|     220071                                   |     PJMEDIA_SDP_ENAMENOTEQUAL                 |     "SDP   name/subject line not equal"                                                                        |
|     220072                                   |     PJMEDIA_SDP_ETIMENOTEQUAL                 |     "SDP   time line not equal"                                                                                |

   -  Codec errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     220080                                   |     PJMEDIA_CODEC_EUNSUP                      |     Unsupported   media codec                                                                                  |
|     220081                                   |     PJMEDIA_CODEC_EFAILED                     |     Codec   internal creation error                                                                            |
|     220082                                   |     PJMEDIA_CODEC_EFRMTOOSHORT                |     "Codec   frame is too short"                                                                               |
|     220083                                   |     PJMEDIA_CODEC_EPCMTOOSHORT                |     "PCM   frame is too short"                                                                                 |
|     220084                                   |     PJMEDIA_CODEC_EFRMINLEN                   |     "Invalid   codec frame length"                                                                             |
|     220085                                   |     PJMEDIA_CODEC_EPCMFRMINLEN                |     "Invalid   PCM frame length"                                                                               |
|     220086                                   |     PJMEDIA_CODEC_EINMODE                     |     Invalid   codec mode (no fmtp)?                                                                            |

   -  Media errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     220100                                   |     PJMEDIA_EINVALIDIP                        |     "Invalid   remote media (IP address"                                                                       |
|     220101                                   |     PJMEDIA_EASYMCODEC                        |     "Asymetric   media codec is not supported"                                                                 |
|     220102                                   |     PJMEDIA_EINVALIDPT                        |     "Invalid   media payload type"                                                                             |
|     220103                                   |     PJMEDIA_EMISSINGRTPMAP                    |     "Missing   rtpmap in media description"                                                                    |
|     220104                                   |     PJMEDIA_EINVALIMEDIATYPE                  |     "Invalid   media type"                                                                                     |
|     220105                                   |     PJMEDIA_EREMOTENODTMF                     |     "Remote   does not support DTMF"                                                                           |
|     220106                                   |     PJMEDIA_RTP_EINDTMF                       |     "Invalid   DTMF digit"                                                                                     |
|     220107                                   |     PJMEDIA_RTP_EREMNORFC2833                 |     "Remote   does not support RFC 2833"                                                                       |

   -  RTP session errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     220120                                   |     PJMEDIA_RTP_EINPKT                        |     "Invalid   RTP packet"                                                                                     |
|     220121                                   |     PJMEDIA_RTP_EINPACK                       |     "Invalid   RTP packing (internal error)"                                                                   |
|     220122                                   |     PJMEDIA_RTP_EINVER                        |     "Invalid   RTP version"                                                                                    |
|     220123                                   |     PJMEDIA_RTP_EINSSRC                       |     "RTP   packet SSRC id mismatch"                                                                            |
|     220124                                   |     PJMEDIA_RTP_EINPT                         |     "RTP   packet payload type mismatch"                                                                       |
|     220125                                   |     PJMEDIA_RTP_EINLEN                        |     "Invalid   RTP packet length"                                                                              |
|     220130                                   |     PJMEDIA_RTP_ESESSRESTART                  |     "RTP   session restarted"                                                                                  |
|     220131                                   |     PJMEDIA_RTP_ESESSPROBATION                |     "RTP   session in probation"                                                                               |
|     220132                                   |     PJMEDIA_RTP_EBADSEQ                       |     "Bad   sequence number in RTP packet"                                                                      |
|     220133                                   |     PJMEDIA_RTP_EBADDEST                      |     "RTP   media port destination is not configured"                                                           |
|     220134                                   |     PJMEDIA_RTP_ENOCONFIG                     |     "RTP   is not configured"                                                                                  |

   -  Media port errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     220160                                   |     PJMEDIA_ENOTCOMPATIBLE                    |     "Media   ports are not compatible"                                                                         |
|     220161                                   |     PJMEDIA_ENCCLOCKRATE                      |     "Media   ports have incompatible clock rate"                                                               |
|     220162                                   |     PJMEDIA_ENCSAMPLESPFRAME                  |     "Media   ports have incompatible samples per frame"                                                        |
|     220163                                   |     PJMEDIA_ENCTYPE                           |     "Media   ports have incompatible media type"                                                               |
|     220164                                   |     PJMEDIA_ENCBITS                           |     "Media   ports have incompatible bits per sample"                                                          |
|     220165                                   |     PJMEDIA_ENCBYTES                          |     "Media   ports have incompatible bytes per frame"                                                          |
|     220166                                   |     PJMEDIA_ENCCHANNEL                        |     "Media   ports have incompatible number of channels"                                                       |

   -  Media file errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|   
|     220180                                   |     PJMEDIA_ENOTVALIDWAVE                     |     "Not   a valid WAVE file"                                                                                  |
|     220181                                   |     PJMEDIA_EWAVEUNSUPP                       |     "Unsupported   WAVE file format"                                                                           |
|     220182                                   |     PJMEDIA_EWAVETOOSHORT                     |     "WAVE   file too short"                                                                                    |
|     220183                                   |     PJMEDIA_EFRMFILETOOBIG                    |     "Sound   frame too large for file buffer"                                                                  |

   -  Sound device errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|  
|     220200                                   |     PJMEDIA_ENOSNDREC                         |     "No   suitable sound capture device"                                                                       |
|     220201                                   |     PJMEDIA_ENOSNDPLAY                        |     "No   suitable sound playback device"                                                                      |
|     220202                                   |     PJMEDIA_ESNDINDEVID                       |     "Invalid   sound device ID"                                                                                |
|     220203                                   |     PJMEDIA_ESNDINSAMPLEFMT                   |     "Invalid   sample format for sound device"                                                                 |
|     270001                                   |     PJSIP_SIMPLE_ENOPKG                       |     "No   SIP event package with the specified name"                                                           |
|     270002                                   |     PJSIP_SIMPLE_EPKGEXISTS                   |     "SIP   event package already exist"                                                                        |

   -  Presence errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|  
|     270020                                   |     PJSIP_SIMPLE_ENOTSUBSCRIBE                |     "Expecting   SUBSCRIBE request"                                                                            |
|     270021                                   |     PJSIP_SIMPLE_ENOPRESENCE                  |     "No   presence associated with the subscription"                                                           |
|     270022                                   |     PJSIP_SIMPLE_ENOPRESENCEINFO              |     "No   presence info in the server subscription"                                                            |
|     270023                                   |     PJSIP_SIMPLE_EBADCONTENT                  |     "Bad   Content-Type for presence"                                                                          |
|     270024                                   |     PJSIP_SIMPLE_EBADPIDF                     |     "Bad   PIDF content for presence"                                                                          |
|     270025                                   |     PJSIP_SIMPLE_EBADXPIDF                    |     "Bad   XPIDF content for presence"                                                                         |
|     270026                                   |     PJSIP_SIMPLE_EBADRPID                     |     "Invalid   or bad RPID document"                                                                           |

   -  isComposing errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     270040                                   |     PJSIP_SIMPLE_EBADISCOMPOSE                |     "Bad   isComposing indication/XML message"                                                                 |

   -  STUN errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|
|     320001                                   |     PJLIB_UTIL_ESTUNRESOLVE                   |     Unable   to resolve STUN server                                                                            |
|     320002                                   |     PJLIB_UTIL_ESTUNINMSGTYPE                 |     Unknown   STUN message type                                                                                |
|     320003                                   |     PJLIB_UTIL_ESTUNINMSGLEN                  |     Invalid   STUN message length                                                                              |
|     320004                                   |     PJLIB_UTIL_ESTUNINATTRLEN                 |     STUN   attribute length error                                                                              |
|     320005                                   |     PJLIB_UTIL_ESTUNINATTRTYPE                |     Invalid   STUN attribute type                                                                              |
|     320006                                   |     PJLIB_UTIL_ESTUNININDEX                   |     Invalid   STUN server/socket index                                                                         |
|     320007                                   |     PJLIB_UTIL_ESTUNNOBINDRES                 |     No   STUN binding response in the message                                                                  |
|     320008                                   |     PJLIB_UTIL_ESTUNRECVERRATTR               |     Received   STUN error attribute                                                                            |
|     320009                                   |     PJLIB_UTIL_ESTUNNOMAP                     |     No   STUN mapped address attribute                                                                         |
|     320010                                   |     PJLIB_UTIL_ESTUNNOTRESPOND                |     Received   no response from STUN server                                                                    |
|     320011                                   |     PJLIB_UTIL_ESTUNSYMMETRIC                 |     Symetric   NAT detected by STUN                                                                            |

   -  XML errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|  
|     320020                                   |     PJLIB_UTIL_EINXML                         |     Invalid   XML message                                                                                      |

   -  DNS errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|  
|     320040                                   |     PJLIB_UTIL_EDNSQRYTOOSMALL                |     DNS   query packet buffer is too small                                                                     |
|     320041                                   |     PJLIB_UTIL_EDNSINSIZE                     |     Invalid   DNS packet length                                                                                |
|     320042                                   |     PJLIB_UTIL_EDNSINCLASS                    |     Invalid   DNS class                                                                                        |
|     320043                                   |     PJLIB_UTIL_EDNSINNAMEPTR                  |     Invalid   DNS name pointer                                                                                 |
|     320044                                   |     PJLIB_UTIL_EDNSINNSADDR                   |     Invalid   DNS nameserver address                                                                           |
|     320045                                   |     PJLIB_UTIL_EDNSNONS                       |     No   nameserver is in DNS resolver                                                                         |
|     320046                                   |     PJLIB_UTIL_EDNSNOWORKINGNS                |     No   working DNS nameserver                                                                                |
|     320047                                   |     PJLIB_UTIL_EDNSNOANSWERREC                |     No   answer record in the DNS response                                                                     |
|     320048                                   |     PJLIB_UTIL_EDNSINANSWER                   |     Invalid   DNS answer                                                                                       |
|     320051                                   |     PJLIB_UTIL_EDNS_FORMERR                   |     DNS   \Format error\""                                                                                     |
|     320052                                   |     PJLIB_UTIL_EDNS_SERVFAIL                  |     DNS   \Server failure\""                                                                                   |
|     320053                                   |     PJLIB_UTIL_EDNS_NXDOMAIN                  |     DNS   \Name Error\""                                                                                       |
|     320054                                   |     PJLIB_UTIL_EDNS_NOTIMPL                   |     DNS   \Not Implemented\""                                                                                  |
|     320055                                   |     PJLIB_UTIL_EDNS_REFUSED                   |     DNS   \Refused\""                                                                                          |
|     320056                                   |     PJLIB_UTIL_EDNS_YXDOMAIN                  |     DNS   \The name exists\""                                                                                  |
|     320057                                   |     PJLIB_UTIL_EDNS_YXRRSET                   |     DNS   \The RRset (name type exists\""                                                                      |
|     320058                                   |     PJLIB_UTIL_EDNS_NXRRSET                   |     DNS   \The RRset (name type does not exist\""                                                              |
|     320059                                   |     PJLIB_UTIL_EDNS_NOTAUTH                   |     DNS   \Not authorized\""                                                                                   |
|     320060                                   |     PJLIB_UTIL_EDNS_NOTZONE                   |     DNS   \The zone specified is not a zone\""                                                                 |

   -  STUN errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------|  
|     320110                                   |     PJLIB_UTIL_ESTUNTOOMANYATTR               |     Too   many STUN attributes                                                                                 |
|     320111                                   |     PJLIB_UTIL_ESTUNUNKNOWNATTR               |     Unknown   STUN attribute                                                                                   |
|     320112                                   |     PJLIB_UTIL_ESTUNINADDRLEN                 |     Invalid   STUN socket address length                                                                       |
|     320113                                   |     PJLIB_UTIL_ESTUNIPV6NOTSUPP               |     STUN   IPv6 attribute not supported                                                                        |
|     320114                                   |     PJLIB_UTIL_ESTUNNOTRESPONSE               |     Expecting   STUN response message                                                                          |
|     320115                                   |     PJLIB_UTIL_ESTUNINVALIDID                 |     STUN   transaction ID mismatch                                                                             |
|     320116                                   |     PJLIB_UTIL_ESTUNNOHANDLER                 |     Unable   to find STUN handler for the request                                                              |
|     320118                                   |     PJLIB_UTIL_ESTUNMSGINTPOS                 |     Found   non-FINGERPRINT attr. after MESSAGE-INTEGRITY                                                      |
|     320119                                   |     PJLIB_UTIL_ESTUNFINGERPOS                 |     Found   STUN attribute after FINGERPRINT                                                                   |
|     320120                                   |     PJLIB_UTIL_ESTUNNOUSERNAME                |     Missing   STUN USERNAME attribute                                                                          |
|     320122                                   |     PJLIB_UTIL_ESTUNMSGINT                    |     Missing/invalid   STUN MESSAGE-INTEGRITY attribute                                                         |
|     320123                                   |     PJLIB_UTIL_ESTUNDUPATTR                   |     Found   duplicate STUN attribute                                                                           |
|     320124                                   |     PJLIB_UTIL_ESTUNNOREALM                   |     Missing   STUN REALM attribute                                                                             |
|     320125                                   |     PJLIB_UTIL_ESTUNNONCE                     |     Missing/stale   STUN NONCE attribute value                                                                 |
|     320126                                   |     PJLIB_UTIL_ESTUNTSXFAILED                 |     STUN   transaction terminates with failure                                                                 |

   -  HTTP Client

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     320151                                   |     PJLIB_UTIL_EHTTPINURL                     |     Invalid   URL format                                                                                       |
|     320152                                   |     PJLIB_UTIL_EHTTPINPORT                    |     Invalid   URL port number                                                                                  |
|     320153                                   |     PJLIB_UTIL_EHTTPINCHDR                    |     Incomplete   response header received                                                                      |
|     320154                                   |     PJLIB_UTIL_EHTTPINSBUF                    |     Insufficient   buffer                                                                                      |
|     320155                                   |     PJLIB_UTIL_EHTTPLOST                      |     "Connection   lost"                                                                                        |

   -  STUN related error codes

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     370001                                   |     PJNATH_EINSTUNMSG                         |     "Invalid   STUN message"                                                                                   |
|     370002                                   |     PJNATH_EINSTUNMSGLEN                      |     "Invalid   STUN message length"                                                                            |
|     370003                                   |     PJNATH_EINSTUNMSGTYPE                     |     "Invalid   or unexpected STUN message type"                                                                |
|     370004                                   |     PJNATH_ESTUNTIMEDOUT                      |     "STUN   transaction has timed out"                                                                         |
|     370021                                   |     PJNATH_ESTUNTOOMANYATTR                   |     "Too   many STUN attributes"                                                                               |
|     370022                                   |     PJNATH_ESTUNINATTRLEN                     |     "Invalid   STUN attribute length"                                                                          |
|     370023                                   |     PJNATH_ESTUNDUPATTR                       |     "Found   duplicate STUN attribute"                                                                         |
|     370030                                   |     PJNATH_ESTUNFINGERPRINT                   |     "STUN   FINGERPRINT verification failed"                                                                   |
|     370031                                   |     PJNATH_ESTUNMSGINTPOS                     |     "Invalid   STUN attribute after MESSAGE-INTEGRITY"                                                         |
|     370033                                   |     PJNATH_ESTUNFINGERPOS                     |     "Invalid   STUN attribute after FINGERPRINT"                                                               |
|     370040                                   |     PJNATH_ESTUNNOMAPPEDADDR                  |     "STUN   (XOR-MAPPED-ADDRESS attribute not found"                                                           |
|     370041                                   |     PJNATH_ESTUNIPV6NOTSUPP                   |     "STUN   IPv6 attribute not supported"                                                                      |
|     370042                                   |     PJNATH_EINVAF                             |     "Invalid   STUN address family value"                                                                      |
|     370050                                   |     PJNATH_ESTUNINSERVER                      |     "Invalid   STUN server or server not configured"                                                           |
|     370060                                   |     PJNATH_ESTUNDESTROYED                     |     "STUN   object has been destoyed"                                                                          |

   -  ICE related errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     370080                                   |     PJNATH_ENOICE                             |     "ICE   session not available"                                                                              |
|     370081                                   |     PJNATH_EICEINPROGRESS                     |     "ICE   check is in progress"                                                                               |
|     370082                                   |     PJNATH_EICEFAILED                         |     "All   ICE checklists failed"                                                                              |
|     370083                                   |     PJNATH_EICEMISMATCH                       |     "Default   target doesn't match any ICE candidates"                                                        |
|     370086                                   |     PJNATH_EICEINCOMPID                       |     "Invalid   ICE component ID"                                                                               |
|     370087                                   |     PJNATH_EICEINCANDID                       |     "Invalid   ICE candidate ID"                                                                               |
|     370088                                   |     PJNATH_EICEINSRCADDR                      |     "Source   address mismatch"                                                                                |
|     370090                                   |     PJNATH_EICEMISSINGSDP                     |     "Missing   ICE SDP attribute"                                                                              |
|     370091                                   |     PJNATH_EICEINCANDSDP                      |     "Invalid   SDP \"candidate\" attribute"                                                                    |
|     370092                                   |     PJNATH_EICENOHOSTCAND                     |     "No   host candidate associated with srflx"                                                                |
|     370093                                   |     PJNATH_EICENOMTIMEOUT                     |     "Controlled   agent timed out waiting for nomination"                                                      |

   -  TURN related errors

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     370120                                   |     PJNATH_ETURNINTP                          |     "Invalid/unsupported   transport"                                                                          |

   -  Audio Device errors shouldn't be used

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     420001                                   |     PJMEDIA_EAUD_ERR                          |     "Unspecified   audio device error"                                                                         |
|     420002                                   |     PJMEDIA_EAUD_SYSERR                       |     "Unknown   error from audio driver"                                                                        |
|     420003                                   |     PJMEDIA_EAUD_INIT                         |     "Audio   subsystem not initialized"                                                                        |
|     420004                                   |     PJMEDIA_EAUD_INVDEV                       |     "Invalid   audio device"                                                                                   |
|     420005                                   |     PJMEDIA_EAUD_NODEV                        |     "Found   no audio devices"                                                                                 |
|     420006                                   |     PJMEDIA_EAUD_NODEFDEV                     |     "Unable   to find default audio device"                                                                    |
|     420007                                   |     PJMEDIA_EAUD_NOTREADY                     |     "Audio   device not ready"                                                                                 |
|     420008                                   |     PJMEDIA_EAUD_INVCAP                       |     "Invalid   or unsupported audio capability"                                                                |
|     420009                                   |     PJMEDIA_EAUD_INVOP                        |     "Invalid   or unsupported audio device operation"                                                          |
|     4200010                                  |     PJMEDIA_EAUD_BADFORMAT                    |     "Bad   or invalid audio device format"                                                                     |
|     4200011                                  |     PJMEDIA_EAUD_SAMPFORMAT                   |     "Invalid   audio device sample format"                                                                     |
|     4200012                                  |     PJMEDIA_EAUD_BADLATENCY                   |     "Bad   audio latency setting"                                                                              |

   -  NAT defined status code

|     Status   Code                            |     Code   Name                               |     Description                                                                                                |
|----------------------------------------------|-----------------------------------------------|----------------------------------------------------------------------------------------------------------------| 
|     60000000                                 |     NATNL_SC_TNL_CREATE_LIST_FAILED           |     Failed   to create list                                                                                    |
|     60000001                                 |     NATNL_SC_TNL_CREATE_SOCK_FAILED           |     Failed   to create socket, lport of tunnel port may be already in use                                      |
|     60000002                                 |     NATNL_SC_TNL_ADD_OBJECT_FAILED            |     Failed   to add object to list                                                                             |
|     60000003                                 |     NATNL_SC_TNL_ANOTHER_CALL_ALREADY_MADE    |     UAC   already called other UAS                                                                             |
|     60000004                                 |     NATNL_SC_ALREADY_INITED                   |     SDK   is already initialized, please do de-initialization first.                                           |
|     60000005                                 |     NATNL_SC_NOT_INITED                       |     SDK   is not initialized, please do initialization first.                                                  |
|     60000006                                 |     NATNL_SC_MAKE_CALL_TIMEOUT                |     sdk   doesn't finish making call process in timeout(defined in natnl_make_call's   timeout_sec) period.    |
|     60000007                                 |     NATNL_SC_IP_CHANGED                       |     ip   has changed, must do deinit and init again.                                                           |
|     60000008                                 |     NATNL_SC_TOO_MANY_INSTANCES               |     allocate   too many instances.                                                                             |
|     60000011                                 |     NATNL_SC_DE_INITIALIZING                  |     SDK   is de-initializing.                                                                                  |
|     60000012                                 |     NATNL_SC_INITIALIZING                     |     SDK   is initializing                                                                                      |
|     60000013                                 |     NATNL_SC_CONNECT_TO_SIP_TIMEOUT           |     SDK   fails to connect to SIP server with connection timeout.                                              |
|     60000015                                 |     NATNL_SC_UDT_CONNECT_FAILED               |     UDT   connect failed.  

<a name="dm-attachment_sid"></a>
### SID

   -  sid(使用userticket登入者): 1004
   -  sid(使用openid登入者):
     
|     Sid       |     Auth_type       |
|---------------|---------------------|
|     1004.1    |     GoogleSignIn    |
|     1004.2    |     ASUSNWOauth     |
|     1004.3    |     ASUSVIPCN       |
|     1004.4    |     QQ              |
|     1004.5    |     WeChat          |
|     1004.6    |     Weibo           |
|     1004.7    |     Facebook        |
|     1004.8    |     Apple           |

   - sid(其他):
     
|     Service    |     Service Description     |     Auth Type        |
|----------------|-----------------------------|----------------------|
|     0000       |     General Service         |     ASUS SSO         |
|     0001       |     AOConnect(HomeCloud)    |     ASUS SSO         |
|     0001.01    |     HomeCloud               |     AWS              |
|     0002       |     Media Streamer          |     ASUS SSO         |
|     0003       |     AOHelp                  |     ASUS SSO         |
|     0004       |     WiFiGo                  |     ASUS SSO         |
|     1001       |     AiCloud                 |     ASUSDDNS         |
|     1002       |     AiCam                   |     ASUS SSO         |
|     1004.1     |     AiCloud                 |     Google Signin    |
|     2001       |     ASUStor File Server     |     ASUS SSO         |
|     2001.01    |     ASUStor File Server     |     AWS generic      |
|     9999       |     Debug Service           |     ASUS SSO         |

### Device type

|     Device Type    |     Device Type Description        | remark |
|--------------------|------------------------------------|--------|
|     01             |     PC(Windows Native)             |        |
|     02             |     PC(MAC)                        |        |
|     03             |     PC(Linux)                      |        |
|     04             |     PC(Java)                       |        |
|     05             |     NAS                            |        |
|     06             |     IPCam                          |        |
|     07             |     RDP Client/Server              |        |
|     11             |     Windows Mobile                 |        |
|     12             |     iOS                            |        |
|     13             |     Android                        |        |
|     14             |     Alexa/IFTTT/Google endpoint    |        |
|     91             |     No Bound Client – Windows      |        |
|     92             |     No Bound Client – MAC          |        |
|     93             |     No Bound Client – Linux        |        |

[Top](#dm-top)
