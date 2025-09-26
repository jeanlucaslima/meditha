```
START
  |
  v
[1] Abertura (Presentation)
  |
  v
[2] Faixa Etária (SC)
  |
  v
[3] Prova Social (Presentation)
  |
  v
[4] Diagnóstico Sono (SC)
  |---- A: "Não tenho problemas" -----------------------------.
  |                                                          |
  |                                                          v
  |                                            [10] Desejo Principal (MC)
  |                                                          |
  |                                                          v
  |                                            [11] Depoimentos (Presentation)
  |                                                          |
  |                                                          v
  |                                            [12] Conhecimento (SC, pers.)
  |                                                          |
  |                                                          v
  |                                            [13] Direcionamento (SC)
  |                                                          |
  |                                                          v
  |                                            [14] Promessa (Presentation, pers.)
  |                                                          |
  |                                                          v
  |                                            [15] Micro-Compromisso (SC)
  |                                                          |
  |                                                          v
  |                                            [16] Carregando (Loading)
  |                                                          |
  |                                                          v
  |                                            [17] Preparação (Presentation, pers.)
  |                                                          |
  |                                                          v
  |                                            [18] Oferta + CTA (Presentation)
  |
  '---- B/C/D: ("Demoro p/ dormir" | "Acordo várias vezes" | "Acordo cansado")
               |
               v
          [4b] Horas Dormidas (SC)
               |---- X: ">8h" ------------------------.
               |                                      |
               |                                      v
               |                               [7] Ansiedade (SC)
               |                                      |---- N: "Nunca" ------.
               |                                      |                      |
               |                                      v                      v
               |                               [8] Impactos (MC)      [9] Consequências (MC)
               |                                      |                      |
               |                                      '----------.-----------'
               |                                                 |
               |                                                 v
               |                                           [10] Desejo (MC)
               |                                                 |
               |                                                 v
               |                                           [11] Depoimentos (Pres.)
               |                                                 |
               |                                                 v
               |                                           [12] Conhecimento (SC, pers.)
               |                                                 |
               |                                                 v
               |                                           [13] Direcionamento (SC)
               |                                                 |
               |                                                 v
               |                                           [14] Promessa (Pres., pers.)
               |                                                 |
               |                                                 v
               |                                           [15] Micro-Compromisso (SC)
               |                                                 |
               |                                                 v
               |                                           [16] Carregando
               |                                                 |
               |                                                 v
               |                                           [17] Preparação (Pres., pers.)
               |                                                 |
               |                                                 v
               |                                           [18] Oferta + CTA
               |
               '---- Y/Z: ("<5h" | "5–6h" | "7–8h")
                          |
                          v
                     [5] Lead (Form: Nome + Email)
                          + Consentimento (checkbox: "Concordo com o tratamento de dados conforme a Política")
                          |
                          v
                     [6] Remédios (SC, pers.)
                          |---- R1: "Uso frequentemente" -> flag branch_heavy_remedios
                          |---- R4: "Nunca"              -> flag no_remedios
                          '---- else
                          |
                          v
                     [7] Ansiedade (SC)
                          |---- N: "Nunca" ------------------------.
                          |                                        |
                          v                                        v
                     [8] Impactos (MC)                      [9] Consequências (MC)
                          |                                        |
                          '-----------------------------.----------'
                                                        |
                                                        v
                                                   [10] Desejo (MC)
                                                        |
                                                        v
                                                   [11] Depoimentos (Pres.)
                                                        |   (ordem/ênfase varia por diagnóstico/remédios/ansiedade)
                                                        v
                                                   [12] Conhecimento (SC, pers.)
                                                        |
                                                        v
                                                   [13] Direcionamento (SC)
                                                        |
                                                        v
                                                   [14] Promessa (Pres., pers.)
                                                        |   (copia ajusta se R1 "uso frequente" ou R4 "nunca")
                                                        v
                                                   [15] Micro-Compromisso (SC)
                                                        |---- M3: "Medo de falhar" -> rassurance tag
                                                        '---- else
                                                        |
                                                        v
                                                   [16] Carregando
                                                        |
                                                        v
                                                   [17] Preparação (Pres., pers.)
                                                        |
                                                        v
                                                   [18] Oferta + CTA (R$67)
```
