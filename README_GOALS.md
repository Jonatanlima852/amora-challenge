# aMORA Challenge — Visão Geral dos problemas e endereçamento de soluções

Este documento explicita os problemas e como foram adequadamente endereçados pela solução.

# Problemas identificados e propostas de solução

## 1. Desorganização da busca de imóveis

**Como é atualmente:** Leads organizam imóveis em prints, grupos de whatsapp, notas soltas. Fica difícil lembrar do que viu e comparar opções. 

**Como será na solução:** O usuário enviará o link por whatsapp para o bot. O bot fará uma análise e:

1. Trará **insigths imediatos** via whatsapp, junto a uma **pontuação** e resumo de **características importantes**.
2. **Adicionará no banco de dados**, e ficará disponível para o usuário na interface. 

Além disso, no portal, haverá um **botão para comparar imóveis** selecionados dentre os adicionados, utilizando IA. Assim, resolvendo o problema do salvamento e comparação entre imóveis. 

---

## 2. Falta de engajamento contínuo 

**Como é atualmente:** Leads somem. Apenas voltam se acham algo sozinhos. 

**Como será na solução:** Uma vez por semana rodará um cron job para **buscar imóveis similares** aos adicionados e respeitando as características informadas na plataforma(personalização das necessidades do usuário). 

Os imóveis encontrados são enviados com o devido detalhamento e link por whatsapp, para o usuário escolher quais adicionar ou não. **Isso resultará na ativação do Lead**. 

**Ideia extra:** Interface do gestor pode ter as datas dos últimos acessos e possibilidade de ativar por email ou whatsapp. 

---

## 3. Dificuldade de colaboração

**Como é feito atualmente:** Jornada de compra é feita por múltiplas pessoas. Cada um salva e compartilha de um jeito. 

**Como será na solução:** **Haverá grupos**, que podem conter somentes usuários, mas também usuários e corretores. E sempre que o usuário se inserir em um grupo, **todos imóveis adicionados** por ele serão imediamente considerados do grupo. 

A criação do grupo será através de um **link de compatilhamento**. 

**Ideia extra:** Cada imóvel compartilhado poderá ter **reações e comentários** de cada participante do grupo. Deve vir com a informação de quem adicionou. 

**OBS:** O corretor deverá **informar a qual grupo** está adicionando o imóvel, pois ele poderá ter vários grupos. O imóvel deve vir com algum identificador. 

---

## 4. Corretores sem ferramentas para apresentar a aMORA

**Como é feito atualmente:** Corretor quer ajudar o lead, mas não sabe como introduzir a aMORA. Hoje ele envia um PDF, um link ou simplesmente menciona no boca-a-boca.

**Como será na solução:** Página **personalizada** para cada correror (ex: amora.app/corretor-joao), com as devidas call-to-actions, bom design, apresentando **vantagens da aMORA**. 

Além disso, o corretor poderá **cadastrar imóveis** que serão apresentados na sua página em **destaque**. 


## 5. Captação e ativação de leads sem custo de mídia

**Como é feito atualmente:** Não se pode depender de mídia paga. Precisa-se de algo que possa viralizar via whatsapp ou boca-a-boca.


**Como será na solução:** O foco será na usabilidade e na personalização. Consideraremos o seguinte:

1. Será um **site**, para não ser necessário instalar nada. O **link ficará na descrição de bot**, que envia o link do site quando um imóvel for adicionado. 

2. Foco na integração com whatsapp: por ele poderemos **adicionar imóveis** e o bot poderá **buscar imóveis cadastrados** também. O bot **enviará resumos** quando requisitado pelo usuário e também será responsável pela ativação de Lead. 

3. Além de site personalizado, o corretor poderá exportar um **png com call to action da aMORA e imóveis destaque**, para compartilhar nas redes sociais. 

4. Uso do bot para adicionar imóveis e buscá-los **sem login obrigatório**. Porém, só é possível acessar as ferramentas mais completas do site após login e associação com o número (confirmação via whatsapp). 

5. Ferramenta disponível sem login: **comparação de até 5 urls de imóveis**. (problema: não sei como setar um limite para o usuário não explorar essa feature)




## Fluxo alto nível

1. **Usuário envia um link no WhatsApp** → UltraMsg → **Webhook** `/api/webhooks/ultramsg`.

2. Webhook **normaliza telefone** (E164), **upsert** de `User`.

3. Extrai **primeira URL** da mensagem, cria `Property` **stub** e chama **parsing**.

4. Parsing salva atributos (preço, m², condomínio, bairro, fotos…) e calcula **Índice aMORA**.

5. Sistema responde no WhatsApp: “Imóvel salvo ✅ | Índice aMORA 78 | ver no app: <link>”.

6. No app, usuário vê **lista**, marca favoritos, **compara** até 4 e **gera resumo**.

7. Corretor monta **página por slug** e envia para o lead.

8. Rotina de **notificações** dispara envios (UltraMsg) quando houver novidades/semana fechada.

---

