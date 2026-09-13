पहाड़ — Launch Package

यह पहला launch-ready STATIC version है। CMS अभी जानबूझकर नहीं जोड़ा गया है।

इस पैकेज में:
- Premium responsive homepage
- योजनाएं
- योजना detail template
- किसान section
- आज की 10 news section
- 13 districts
- videos
- about
- SEO title/description basics
- mobile navigation
- Nanda Devi hero image
- सभी मुख्य navigation links working

IMPORTANT:
1. फिलहाल demo/sample content है। असली योजना की राशि/पात्रता/तारीख publish करने से पहले official source से verify करें।
2. Nanda Devi image का credit assets/CREDITS.md में है।
3. CMS बाद में जोड़ना आसान रहेगा क्योंकि pages/content structure अलग रखा गया है।

LOCAL:
index.html पर double-click करके Chrome में खोल सकते हैं।
कुछ browsers local file से Google Fonts/image रोक सकते हैं; इंटरनेट रहते image/font लोड होंगे।

LIVE LAUNCH — आसान तरीका:
Cloudflare Pages + GitHub इस्तेमाल करें।
- GitHub पर नया repository बनाएं
- इस ZIP को extract करके सभी files repository में upload करें
- Cloudflare Pages में repository connect करें
- Build command: खाली छोड़ें
- Output directory: /
- Deploy करें
- पहले *.pages.dev URL मिलेगा
- फिर अपना domain जोड़ें

अगर GitHub/Cloudflare नहीं करना चाहते, किसी भी normal static hosting में पूरी folder upload कर दें।
