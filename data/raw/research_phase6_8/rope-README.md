---
license: mit
---

# Models

These models are created from their respective IndicTrans2 parent versions by simplying replacing the Sinusoidal Positional Embedding with Rotary Positional Embedding ([Su _et al._](https://arxiv.org/abs/2104.09864)), and finetuning them for further alignment.

_NOTE_:
These models are my independent reproduction of the paper: [Towards Inducing Long-Context Abilities in Multilingual Neural Machine Translation Models](https://aclanthology.org/2025.naacl-long.366/).

Detailed information on the data mixture, hyperparameters, and training curriculum can be found in the paper.

# Usage

The usage instructions are very similar to [IndicTrans2 HuggingFace models](https://huggingface.co/collections/ai4bharat/indictrans2-664ccb91d23bbae0d681c3ca), you'll need to install the [IndicTransToolkit](https://github.com/VarunGumma/IndicTransToolkit) to use the `IndicProcessor` module to pre-process the source texts before generating translations.

```python
import torch
import warnings
from IndicTransToolkit.processor import IndicProcessor
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

warnings.filterwarnings("ignore")
model_name = "prajdabre/rotary-indictrans2-indic-en-dist-200M"
device = "cuda" if torch.cuda.is_available() else "cpu"

sentences = [
    """लोणार सरोवर हे भारतातील महाराष्ट्र राज्यातील बुलढाणा जिल्ह्यात स्थित एक अद्वितीय, रहस्यमय आणि वैज्ञानिक दृष्टिकोनातून अत्यंत महत्त्वाचे नैसर्गिक आश्चर्य आहे. हे जगातील एकमेव ज्ञात खारट विवर तलाव आहे, आणि त्याचे निर्माण उल्कापिंडाच्या प्रभावामुळे झाल्याचे शास्त्रज्ञांनी सिद्ध केले आहे. साधारणपणे, उल्कापिंडाच्या आघातामुळे काही ठिकाणी खारट सरोवर निर्माण होतात, पण लोणार सरोवर यासाठी एक विशेष उदाहरण आहे, कारण इथे ज्वालामुखीच्या बेसाल्ट खडकात उल्केच्या प्रहारामुळे एक अद्वितीय विवर तयार झाला आहे. सरोवराच्या अद्वितीयतेमुळे, त्याचे पाणी हंगामानुसार रंग बदलते, आणि त्याचे पाणी समुद्राच्या पाण्यापेक्षा सातपट खारट आहे. लोणार सरोवर शास्त्रज्ञ, पर्यटक, आणि विविध संशोधन संस्थांसाठी एक आकर्षण बनले आहे. लोणार सरोवराची निर्मिती सुमारे ५२,००० ते ५७,००० वर्षांपूर्वी एका अतिवेगवान उल्कापिंडाच्या आघातामुळे झाली. पूर्वी, शास्त्रज्ञ मानत होते की लोणार सरोवर हे ज्वालामुखी प्रमाणेच भूगर्भीय प्रक्रियेमुळे तयार झाले. पण, या सरोवरावर केलेल्या संशोधनाने हे सिद्ध केले की, याची निर्मिती उल्कापिंडाच्या आघातामुळे झाली आहे. एका अतिवेगवान उल्कापिंडाच्या आघाताने बेसाल्ट खडक वितळले आणि काचेच्या कणांची निर्मिती झाली, ज्याला मास्केलिनाइट असे म्हटले जाते. या प्रक्रिया आणि तंत्रज्ञानाने लोणार सरोवर हे खरोखरच वैज्ञानिक दृष्टिकोनातून अत्यंत महत्त्वाचे ठरते. लोणार सरोवराची भौगोलिक रचना एकदम विशेष आहे. याची खोली १५० मीटर आणि व्यास १.२ किलोमीटर आहे. या सरोवराचे पाणी हंगामानुसार बदलते आणि त्यामुळे या सरोवराच्या पाण्याचा रंग वेगवेगळ्या कालखंडात बदलतो. ग्रीष्मकालात ते पाणी गुलाबी, तर पावसाळ्यात हळूच हिरवट होऊ शकते. याचे कारण म्हणजे पाण्यात सूक्ष्मजीवांच्या विविध प्रजातींच्या उपस्थितीमुळे रंगद्रव्य तयार होतात. यासाठी ड्युनालिएला सॅलिना आणि हॅलोबॅक्टेरियासी यांसारखी सूक्ष्मजीव जबाबदार आहेत. यामुळे हे सरोवर एकमात्र खारट आणि अल्कधर्मी पाणी असलेला तलाव बनला आहे, जो जैवविविधतेच्या दृष्टिकोनातून देखील महत्त्वाचा ठरतो. लोणार सरोवराच्या पाण्यात विविध सूक्ष्मजीवांच्या प्रजातींची मोठी विविधता आहे. त्यातील काही प्रजाती या केवळ लोणार सरोवराच्या वातावरणातच आढळतात, ज्यामुळे त्या इथे पर्यावरणीय समतोल राखण्यात मदत करतात. या सूक्ष्मजीवांची वैशिष्ट्ये आणि त्यांचा पाणी प्रदूषणावर होणारा प्रभाव शास्त्रज्ञांसाठी एक महत्त्वाचा अभ्यासविषय ठरला आहे. या पाणीप्रणालीचे जैविक महत्त्व इतकेच नाही, तर यामुळे लोणार सरोवर कशाप्रकारे शारिरीक आणि रासायनिक बदलांना प्रतिसाद देतो, हे देखील वैज्ञानिक संशोधनाचे एक मुख्य भाग आहे. सरंक्षणाच्या दृष्टीने, लोणार सरोवर हे अनेक स्थानिक आणि स्थानिक नसलेल्या प्रजातींना आश्रय देणारे एक महत्त्वाचे जैवविविधता केंद्र बनले आहे. या प्रदेशात अनेक वनस्पती आणि जीवजंतू आढळतात, ज्यांचे अस्तित्व इथे अद्वितीय आहे. यामुळे या सरोवराला संरक्षित क्षेत्र म्हणून महत्व देण्याची आवश्यकता निर्माण झाली आहे. जवळपासच्या सांडपाण्याच्या नद्या आणि अन्य दूषित पाणी सरोवरात मिसळल्याने त्याचे प्रदूषण वाढत आहे. त्याचप्रमाणे, अतिक्रमण आणि आक्रमक प्रजातींच्या वाढीमुळे जैवविविधतेला धोका निर्माण झाला आहे. लोणार सरोवर फक्त जैवविविधतेचे आणि भौगोलिक महत्त्वाचे स्थान नाही, तर त्याचे ऐतिहासिक आणि सांस्कृतिक महत्त्व देखील अत्यंत मोठे आहे. या सरोवरासमोर प्राचीन मंदिरे वसलेली आहेत. त्यातील काही मंदिरे ६व्या शतकातील आहेत. या मंदीरांचा स्थापत्यशास्त्र आणि कलात्मक कौशल्य देखील एका महत्त्वाच्या सांस्कृतिक वारशाचे प्रतीक आहे. लोणार सरोवराचे स्थान स्थानिक लोकांसाठी अत्यंत पवित्र मानले जाते. त्यांचा विश्वास आहे की, भगवान विष्णूने या सरोवराची निर्मिती केली, ज्यामुळे या सरोवराला आणि त्याच्या परिसराला धार्मिक महत्त्व आहे. पुराणांमध्ये लोणार सरोवराचे उल्लेख "विराजतीर्थ" किंवा "बैरजतीर्थ" असा आलेला आहे. काही मान्यतेनुसार, प्रभू राम यांनी आपली पत्नी सीतेला लोणार सरोवर दाखवले, जेव्हा ते अयोध्येला परतत होते. हे पुराणिक संदर्भ आजही स्थानिक लोकांमध्ये सांगितले जातात, ज्यामुळे सरोवराचा सांस्कृतिक महत्त्व नेहमीच लक्षात येतो. लोणार सरोवराच्या महत्त्वावर अनेक राष्ट्रीय आणि आंतरराष्ट्रीय संस्था संशोधन करत आहेत. या सरोवरातील खनिजांचे विश्लेषण करण्यात आले आहे, ज्यामुळे चंद्राच्या खडकांसारखी खनिजे यामध्ये आढळली आहेत. यामुळे लोणार सरोवर आणि चंद्राच्या भूगर्भशास्त्राचा संबंध जोडला गेला आहे. शास्त्रज्ञांच्या मते, लोणार सरोवर एक उत्तम "ऍनालॉग" ठरू शकते, जे चंद्राच्या भूगर्भशास्त्राचा अभ्यास करतांना उपयोगी ठरू शकेल. नासा आणि भारतीय अंतराळ संशोधन संस्थेने, या सरोवराच्या भूवैज्ञानिक संरचनांना चंद्राच्या पृष्ठभागाशी मिळती-जुळती मानली आहे. यामुळे, या सरोवराचा अभ्यास चंद्रावरील भविष्यातील मॅन मिशन्ससाठी उपयुक्त ठरू शकतो. यासाठीच, आयआयटी बॉम्बेनेही या सरोवराच्या मातीचा अभ्यास केला आणि यावरून त्याला चंद्रावरील खनिजांशी समानता सापडली. आजच्या घडीला लोणार सरोवरावर अनेक संकटे आलेली आहेत. प्रदूषण, स्थानिक अतिक्रमण आणि प्रजातींच्या असंतुलित वाढीमुळे सरोवराच्या पर्यावरणावर मोठा धोका निर्माण झाला आहे. २०२० मध्ये लोणार सरोवराला "रामसर साइट" म्हणून घोषित करण्यात आले, जे एक पाणथळ जागा म्हणून ओळखले जाते. यामुळे लोणार सरोवराच्या जतनासाठी अधिक संसाधने आणि संरक्षणात्मक धोरणांची आवश्यकता आहे. लोणार सरोवराची पाण्याची पातळी देखील वाढत आहे, ज्यामुळे तो आणखी एका धोका निर्माण करत आहे. या सरोवराच्या संरक्षणासाठी स्थानिक प्रशासनाने आणि सरकारने उपाययोजना करणे आवश्यक आहे. सांडपाणी, दुर्गंधी आणि अपारदर्शक पाणी यामुळे लोणार सरोवराचे जैवविविधता आणि पर्यावरणीय महत्त्व गमावू शकते. लोणार सरोवर हे खरोखरच एक नैसर्गिक चमत्कार आहे. त्याची भौगोलिक रचना, जैवविविधता, ऐतिहासिक महत्त्व आणि वैज्ञानिक वैशिष्ट्ये यामुळे हे एक अत्यंत महत्त्वाचे ठिकाण बनले आहे. लोणार सरोवराच्या संरक्षणासाठी सरकारी आणि सामाजिक प्रयत्नांची आवश्यकता आहे, जेणेकरून या अद्वितीय सरोवराचे सौंदर्य आणि महत्त्व कायम राहील. आजच्या घडीला लोणार सरोवर एका अद्वितीय जैवविविधतेच्या केंद्रासाठी, ऐतिहासिक वारशाच्या प्रतीकासाठी, आणि वैज्ञानिक संशोधनासाठी एक आदर्श ठिकाण बनले आहे."""
]

ip = IndicProcessor(inference=True)
tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)

model = AutoModelForSeq2SeqLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    trust_remote_code=True,
).to(device)

batch = ip.preprocess_batch(sentences, src_lang="mar_Deva", tgt_lang="eng_Latn")

batch = tokenizer(
    batch, padding="longest", truncation=True, max_length=2048, return_tensors="pt"
).to(device)

with torch.inference_mode():
    outputs = model.generate(
        **batch,
        num_beams=10,
        length_penalty=1.5,
        repetition_penalty=2.0,
        num_return_sequences=1,
        max_new_tokens=2048,
        early_stopping=True
    )

# no target_tokenizer scoping is required anymore
outputs = tokenizer.batch_decode(
    outputs, skip_special_tokens=True, clean_up_tokenization_spaces=True
)

outputs = ip.postprocess_batch(outputs, lang="eng_Latn")
print(" | > Translations:", outputs[0])
```

# Citation

If you use these models directly or fine-tune them further for additional use cases, please cite the following work:

```bibtex
@inproceedings{gumma-etal-2025-towards,
    title = "Towards Inducing Long-Context Abilities in Multilingual Neural Machine Translation Models",
    author = "Gumma, Varun  and
      Chitale, Pranjal A  and
      Bali, Kalika",
    editor = "Chiruzzo, Luis  and
      Ritter, Alan  and
      Wang, Lu",
    booktitle = "Proceedings of the 2025 Conference of the Nations of the Americas Chapter of the Association for Computational Linguistics: Human Language Technologies (Volume 1: Long Papers)",
    month = apr,
    year = "2025",
    address = "Albuquerque, New Mexico",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2025.naacl-long.366/",
    pages = "7158--7170",
    ISBN = "979-8-89176-189-6"
}
```

# Note

These new and improved models are primarily built and tested for document-level and long-context translations, and the performance of smaller sentence-level tasks might be slightly sub-optimal, and might require generation parameter tuning. Please throughly verify the performance of the models for your usecase before scaling up generation.

# Warning

Occasionally, you may notice some variation in the output, which may not be optimal. In such cases, you can experiment with adjusting the `num_beams`, `repetition_penalty`, and `length_penalty` parameters in the `generation_config`. Based on standard testing, the example with an input size of 1457 can be run on a single A100 GPU. However, the 1B model might require more compute resources or a lower beam size for generation.
