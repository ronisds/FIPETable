**FIPETable**
----
*RESTful Web Service* para disponibilizar os dados da tabela FIPE.

# Introdução

A **Tabela FIPE** é uma base de dados pública que fornece informações sobre os preços dos veículos no Brasil de acordo com meses de referência.

Este projeto, chamado **FIPETable**, consiste de um *web service* que pode ser utilizado para disponibilizar os dados da tabela FIPE na forma de um serviço *RESTful*. Os dados são extraídos diretamente do site oficial da tabela FIPE utilizando a ténica de **web scraping**.

# Instalação

## Requisitos

* [NodeJS v8.1.0](https://nodejs.org)
* [Postgres 9.6.3](https://www.postgresql.org)

## Configuração

Inicialmente é necessário clonar este projeto:

    $ git clone https://github.com/ronisds/FIPETable.git

Execute o *script* que cria a tabela no banco de dados. Para isso é necessário que o *Postgresql* esteja executando. O script está localizado no diretório `FIPETable/api/models/`

    $ cd FIPETable/api/models/
    $ psql -f fipe.sql

Você deverá visualizar as seguintes mensagens:

    DROP DATABASE
    CREATE DATABASE
    You are now connected to database "fipe" as user "roniel".
    CREATE TABLE

Agora execute o seguinte comando para instalar todas as dependências.

    $ cd ../../
    $ npm install

### Opcional

Você pode alterar a quantidade de dados da tabela FIPE obtidos da seguinte forma:

* A FIPE possui uma tabela de referência para cada mês. O serviço irá obter sempre as últimas `3` tabelas (que são referentes aos últimos `3` meses). Este valor pode ser alterado na linha 23 do arquivo do arquivo `FIPETable/server.js`.

        fipeHelper.saveFIPEFromLastReferenceTables(3);

* O arquivo `FIPETable/lib/FIPEScraper.js` é responsável por obter os dados do website da tabela FIPE. Por padrão, será obtido apenas dois modelos por marca, e um ano por modelo. Você pode alterar isso nas linhas `27` e `28` do scraper:

        const MaximumOfModelsByBrand = 2;
        const MaximumOfYearsByModels = 1;

* O scraper obtém apenas um subconjunto de todas as marcas disponíveis. Este subconjunto está disponívei no arquivo FIPETable/lib/brands.json. Você pode alterar este arquivo para adicionar novas marcas. Porém, será necessário inserir o identificador correto da marca adicionada.

> IMPORTANTE: Tenha cuidado com as mudanças mencionadas nesta seção. O aumento nestes valores pode ocasionar em uma sobrecarga de requisições no *website* da tabela FIPE. Isso pode comprometer o funcionamento do FIPETable.

## Execução

Para executar o serviço, basta o seguinte comando:

    $ npm run start


## Documentação

### Tabelas de Referência

Retorna a lista de tabelas de referência disponíveis no serviço.

* **URL**

  `/dates`

* **Método:**

  `GET`

* **Resposta:**

  Lista de tabelas de referência.

  * **Código:** 200 <br />
    **Conteúdo:**
    ```
    {
      "184": "outubro de 2015 ",
      "185": "novembro de 2015 ",
      "186": "dezembro de 2015 "
    }
    ```

* **Exemplo:**

    `curl -G 'http://localhost:3000/dates'`

### Marcas

Retorna a lista marcas disponíveis no serviço por tabela de referência.

* **URL**

  `/brands/:dateId`

* **Método:**

  `GET`

* **Parâmetros**

  **Obrigatórios:**

  `dateId=[alphanumeric]`

  **Opcionais:**

* **Resposta:**

    Lista de marcas presentes na respectiva tabela de referência.

    * **Código:** 200 <br />
      **Conteúdo:**
      ```
      {
         "20": "Ferrari",
         "21": "Fiat",
         "22": "Ford",
         "23": "GM - Chevrolet",
         "25": "Honda",
         "44": "Peugeot",
         "48": "Renault",
         "56": "Toyota",
         "59": "VW - VolksWagen"
      }
      ```

* **Exemplo:**

    `curl -G 'http://localhost:3000/brands/184'`

### Modelos

Retorna a lista de modelos disponíveis no serviço por tabela de referência e por marca.

* **URL**

  `/models/:dateId/:brandId`

* **Método:**

  `GET`

* **Parâmetros**

  **Obrigatórios:**

  `dateId=[alphanumeric]`

  `brandId=[alphanumeric]`

  **Opcionais:**

* **Resposta:**

    Lista de modelos da marca `brandId` presentes na tabela de referência `dateId`.

    * **Código:** 200 <br />
      **Conteúdo:**
      ```
      {
          "417": "348 GTS 3.4",
          "418": "348 Spider 3.4"
      },
      ...
      ```

* **Exemplo:**

  `curl -G 'http://localhost:3000/brands/184'`

### Anos do Modelo

Retorna a lista de anos do modelo `modelId`, da marca `brandId` e da tabela `dateId`.

* **URL**

  `/years/:dateId/:brandId/:modelId`

* **Método:**

  `GET`

* **Parâmetros**

  **Obrigatórios:**

  `dateId=[alphanumeric]`

  `brandId=[alphanumeric]`

  `modelId=[alphanumeric]`

  **Opcionais:**

* **Resposta:**

  Lista de anos do modelo `modelId`, da marca `brandId` e da tabela `dateId`.

  * **Código:** 200 <br />
    **Conteúdo:**
    ```
    [
        {
           "yearid": "1994-1"
        },
        ...
    ]
    ```

* **Exemplo:**

  `curl -G 'http://localhost:3000/brands/184'`

### Veículos

Retorna a lista de veículos com os respectivos parâmetros.

* **URL**

  `/vehicles/:dateId?/:brandId?/:modelId?/:yearId?`

* **Método:**

  `GET`

* **Parâmetros**

  **Obrigatórios:**

  **Opcionais:**

  `dateId=[alphanumeric]`

  `brandId=[alphanumeric]`

  `modelId=[alphanumeric]`

  `yearId=[alphanumeric]`

* **Resposta:**

  Lista de veículos.

  * **Código:** 200 <br />
    **Conteúdo:**
    ```
    [
        {
            "id": 145,
            "value": "R$ 205.378,00",
            "brand": "Ferrari",
            "model": "348 GTS 3.4",
            "modelyear": 1994,
            "fuel": "Gasolina",
            "fipecode": "031014-0",
            "referencemonth": "outubro de 2015 ",
            "referencetableid": 184,
            "brandid": 20,
            "modelid": 417,
            "yearid": "1994-1"
        },
        {
            "id": 146,
            "value": "R$ 201.318,00",
            "brand": "Ferrari",
            "model": "348 Spider 3.4",
            "modelyear": 1994,
            "fuel": "Gasolina",
            "fipecode": "031013-1",
            "referencemonth": "outubro de 2015 ",
            "referencetableid": 184,
            "brandid": 20,
            "modelid": 418,
            "yearid": "1994-1"
        },
        ...
    ]
    ```

* **Exemplo:**

  `curl -G 'http://localhost:3000/vehicles'`

  `curl -G 'http://localhost:3000/vehicles/184'`

  `curl -G 'http://localhost:3000/vehicles/184/20'`

  `curl -G 'http://localhost:3000/vehicles/184/20/417'`

  `curl -G 'http://localhost:3000/vehicles/184/20/417/1994-1'`
