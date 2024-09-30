document.addEventListener('DOMContentLoaded', function() {
    const documentContainer = document.getElementById('document-container');
    const landingSection = document.getElementById('landing');

    // Embedded JSON data
    const pagesData = [
        {
          "page": 1,
          "annotations": [
            {
              "text": "This divestment proposal is a revised version of a report first developed by the Advisory Committee on Corporate Responsibility in Investment Policies, or ACCRIP, in 2020. \n\nNow, ACCRIP’s successor, called ACURM, is reviewing the updated proposal. This version was written by the student-led Brown Divest Coalition.\n\nACURM is due to submit its recommendation on whether to divest to Paxson by Sept. 30."
            },
            {
              "text": "The Brown Divest Coalition, or BDC, is an activist group that has been advocating for the University to divest from companies with Israeli military ties. \n\nIn December 2023, 41 members of BDC were arrested following a sit-in protest in University Hall in which they demanded that Paxson support divestment from “Israeli military occupation” and call for a ceasefire in the Israel-Hamas war."
            }
          ]
        },
        {
          "page": 2,
          "annotations": []
        },
        {
          "page": 3,
          "annotations": []
        },
        {
          "page": 4,
          "annotations": []
        },
        {
          "page": 5,
          "annotations": [
            {
              "text": "On Feb. 25, 2006, the Brown Corporation voted to “divest from companies whose business activities can be shown to be supporting and facilitating the Sudanese government in its continuing sponsorship of genocidal actions and human rights violations in Darfur.” \n\n“We declare our solidarity with the peoples of the Darfur region of Sudan whose struggle to live in peace, freedom and security is an issue of pressing global concern,” former Brown University President Ruth Simmons said at the time."
            },
            {
              "text": "Throughout the 1980s, student activists at Brown protested in favor of the University’s divestment from companies operating in South Africa. In February 1986, the Brown Corporation partially divested, leading to further protests. The next year, 20 members of Students Against Apartheid, an organization campaigning for the University’s divestment from South Africa, disrupted a trustees’ meeting to protest the University’s financial links to South Africa."
            },
            {
              "text": "Brown’s Department of Public Safety arrested 20 Jewish students participating in the sit-in protest in University Hall. \n\nOn Nov. 27, the University requested that the Providence City Solicitor’s Office drop the charges of “willful trespass” against all 20 students. The city agreed to do so."
            },
            {
              "text": "All 41 students were arraigned on Feb. 12 and Feb. 14, where they pled “not guilty” to “willful trespassing within school buildings,” The Herald previously reported. In March, Paxson expressed a commitment to pursuing charges against the students who participated in the sit-in. “It’s actually important that our students understand that there are consequences for their decisions,” Paxson said at the time.\n\nIn April, three members of Providence’s City Council published a letter urging the members of the City Solicitor’s Office to drop the charges against the students, The Herald previously reported. During the following week, the Undergraduate Council of Students also released a statement calling on Paxson to drop the charges.\n\nOn May 14, the city issued six-month “not guilty” verdicts to all 41 students. Provided the students are not rearrested within the six-month period, The case will be dismissed and the students will not receive a criminal record if they are not rearrested within six months of the verdict, The Herald previously reported."
            },
            {
              "text": "On Nov. 25, 2023, Hisham Awartani ’25, Kinnan Abdalhamid and Tahseen Ali Ahmad – Palestinian undergraduate students at Brown, Haverford College and Trinity College respectively – were shot and wounded in Burlington, Vermont, The Herald previously reported.\n\nJason Eaton, the suspect in November’s shooting, has not yet been charged with a hate crime. Eaton pled “not guilty” to three charges of attempted second-degree murder in Nov. 2023."
            },
            {
              "text": "On Feb. 2, 19 Brown students began a hunger strike to demand that the Corporation consider a divestment resolution, The Herald previously reported. At the time, Paxson refused to bring a divestment proposal to the Corporation."
            }
          ]
        },
        {
          "page": 6,
          "annotations": [
            {
              "text": "The Slavery and Justice Report was published in 2006 following a University initiative to investigate Brown’s relation to racial slavery. The report is required reading for incoming first-years since 2021.\n\nIn their September presentation to ACURM, BDC pointed that the report states that Brown has an “special obligation to ensure that it does not profit” from gross injustice."
            },
            {
              "text": "In a February interview with The Herald, Paxson said she would “ask ACURM to fast-track” the consideration process for a new divestment proposal. The organizers of February’s hunger strike argued that ACURM’s consideration timeline was at odds with the “urgency of the crisis in Gaza,” The Herald previously reported."
            },
            {
              "text": "In May 2003, the Advisory Committee on Corporate Responsibility in Investing unanimously recommended that the University divested from companies manufacturing tobacco products. The Corporation ultimately voted in accordance with the recommendation on Sept. 12, 2003."
            },
            {
              "text": "In The Herald’s spring 2024 undergraduate poll, approximately 14% of students indicated that they “strongly” or “somewhat disapproved” of calls for the University to divest from the war between Israel and Hamas. 67% of respondents somewhat or strongly approved a divestment proposal."
            },
            {
              "text": "In a 2023 speech at the International Israel Summit, Paxson expressed her belief that universities should “encourage open dialogue on contentious issues such as Israel-Palestine,” The Herald previously reported. Taking a formal stance on the issue “would undermine Brown’s primary mission of advancing knowledge and understanding,” she said at the time."
            }
          ]
        },
        {
          "page": 7,
          "annotations": []
        },
        {
          "page": 8,
          "annotations": [
            {
              "text": "While ACCRIP defined acts of social harm by the impact companies have on people and the environment, ACURM’s charge defines social harm exclusively as resulting from University financial resources: \n\n“Social harm is defined for the purposes of ACURM as the harmful impact that the investment or expenditure of University financial resources may have on the University community, consumers, employees, or other persons, or on the human or natural environment.”"
            }
          ]
        },
        {
          "page": 9,
          "annotations": [
            {
              "text": "This list of actions also exists in ACURM’s charge, meaning ACURM may recommend any of these actions in response to this proposal."
            },
            {
              "text": "This two-prong test is present in ACURM’s charge. Only one of these requirements is sufficient to recommend divestment. This question was at the center of ACURM’s public meetings as it considered public input about this divestment proposal."
            },
            {
              "text": "In a 2019 UCS referendum, 69% of undergraduate respondents voted in favor of a divestment proposal. Similarly, in The Herald’s spring 2024 poll, 67% percent of respondents voted in support of a divestment proposal."
            },
            {
              "text": "Brown Divest Coalition members used these screening criteria in addition to international databases to identify companies for the 2024 report."
            }
          ]
        },
        {
          "page": 10,
          "annotations": [
            {
              "text": "In 2020, ACCRIP recommended divestment from 11 companies. ACURM is now considering divestment from 10 companies: DXC and Oaktree Capital are not included in the Brown Divest Now Report, which adds Textron and Safariland, while Raytheon and United Technologies merged in 2020 to form RTX Corporation."
            },
            {
              "text": "Like ACCRIP, ACURM heard from two groups of students: one that supports and one that opposes divestment. But ACURM heard their arguments days apart followed by two meetings for public comment."
            },
            {
              "text": "This eight-month timeline is significantly longer than the five months ACURM had to discuss the current proposal. Student protesters voluntarily cleared the encampment last April after Paxson guaranteed their ACURM proposal would be considered on an expedited timeline."
            }
          ]
        },
        {
          "page": 11,
          "annotations": []
        },
        {
          "page": 12,
          "annotations": [
            {
              "text": "In November 2019, anti-divestment students also seemed to agree that the Palestinian people experience social harm, but a key pillar of their case was that the divest proposal would not correct that harm. The anti-divestment students who presented to ACURM this September similarly rejected the claim that Israel’s actions constitute a redressable social harm, while also arguing Israel’s actions don’t meet ACURM’s criteria for social harm."
            }
          ]
        },
        {
          "page": 13,
          "annotations": [
            {
              "text": "Social harm, according to ACCRIP’s charge, pertains to the impact of “the activities of a company or corporation,” but this section did not specify any companies or corporations involved in the activities described. Instead, as the report later suggests, divestment would apply to “any company that profits from the Israeli occupation of Palestinian land.”"
            }
          ]
        },
        {
          "page": 14,
          "annotations": []
        },
        {
          "page": 15,
          "annotations": [
            {
              "text": "ACURM’s current definition of social harm does not limit its scope to the actions of a corporation, allowing for this exception. The new language stresses the need for evidence that the University’s investment itself causes harm."
            }
          ]
        },
        {
          "page": 16,
          "annotations": [
            {
              "text": "The BDS movement emphasizes “nonviolent” pressure on Israel to comply with international law. But pro-Israel organizations such as the American Jewish Committee assert that the movement and its leadership want “nothing less than the elimination of Israel as a Jewish state.”"
            }
          ]
        },
        {
          "page": 17,
          "annotations": [
            {
              "text": "In response to the BDS movement, several US states have passed anti-BDS legislation, which prohibits state entities from working with companies that boycott Israel. Rhode Island passed the “Anti-Discrimination in State Contracts” law in 2016, prohibiting the state from supporting businesses that establish a “boycott of any person, firm or entity based in or doing business with a jurisdiction with whom the state can enjoy open trade.”"
            },
            {
              "text": "Jews for Ceasefire Now has been active in campus organizing for divestment since its formation last fall. Twenty members from the group were arrested in a sit-in at University Hall last November. The University dropped the charges against the students later that month."
            }
          ]
        },
        {
          "page": 18,
          "annotations": [
            {
              "text": "After Brown partially divested from South Africa in 1986, students continued to protest for complete divestment. Students demonstrated during a Corporation meeting the following year, which resulted in the probation of 20 students."
            }
          ]
        },
        {
          "page": 19,
          "annotations": []
        },
        {
          "page": 20,
          "annotations": [
            {
              "text": "In presenting to ACURM this September, Brown Divest Coalition members have had to address the “feasibility and impact of divestment,” given the concerns about divestment being a largely “symbolic” action."
            }
          ]
        },
        {
          "page": 21,
          "annotations": []
        },
        {
          "page": 22,
          "annotations": []
        },
        {
          "page": 23,
          "annotations": []
        },
        {
          "page": 24,
          "annotations": []
        },
        {
          "page": 25,
          "annotations": []
        },
        {
          "page": 26,
          "annotations": [
            {
              "text": "Posters reading “Israel has bombed every university in Gaza, Brown stays silent” have been present at several demonstrations in favor of divestment. Gaza was previously home to 12 universities, though all of them have been destroyed over the course of the war."
            }
          ]
        },
        {
          "page": 27,
          "annotations": [
            {
              "text": "In the referendum 69% of students were in favor of divestment. 3,076 students voted. Paxson responded to the referendum in a letter, noting that Brown’s endowment should not be used as a “political instrument.”"
            },
            {
              "text": "The Graduate Labor Organization is among a number of unions and union federations across the country that are calling for a ceasefire in Gaza."
            }
          ]
        },
        {
          "page": 28,
          "annotations": [
            {
              "text": "Poll respondents were asked, “Recent student activism surrounding the ongoing war between Israel and Hamas has included calls for the University to pass an official divestment resolution. What is your stance on these calls for divestment?” Overall, 45% of students said they strongly approve, 23% of students said they somewhat approve, and 19% said they neither approve nor disapprove."
            }
          ]
        },
        {
          "page": 29,
          "annotations": []
        },
        {
          "page": 30,
          "annotations": [
            {
              "text": "The Who Profits Research Center works to detail the involvement of corporations in “the ongoing Israeli occupation of Palestinian and Syrian land and population.” Its database includes over 400 companies. Of the 10 companies identified in this proposal, four are also listed on the database: Volvo Group, Boeing, General Electric and Motorola Solutions."
            },
            {
              "text": "This project by the UN aimed to “produce a database of all business enterprises involved in certain specified activities related to the Israeli settlements in the occupied Palestinian territory, including East Jerusalem.”"
            }
          ]
        },
        {
          "page": 31,
          "annotations": []
        },
        {
          "page": 32,
          "annotations": [
            {
              "text": "The fiscal year 2022 financial report, the most recent they have published, can be found here."
            },
            {
              "text": "They do not cite any sources in their database and it is unclear who peer reviews these publications."
            }
          ]
        },
        {
          "page": 33,
          "annotations": [
            {
              "text": "Brown has consistently maintained that it only invests with funding managers “whose values are aligned with the Brown community.” The Investment Office has not publicly disclosed which firms manage the endowment."
            }
          ]
        },
        {
          "page": 34,
          "annotations": []
        },
        {
          "page": 35,
          "annotations": [
            {
              "text": "The definition of boycott under the “Anti-Discrimination in State Contracts” bill requires the action to be based on the “race, color, religion, gender, or nationality” of the targeted entity. The writers of the report highlight that their proposal does not target any companies on any of those basis."
            }
          ]
        },
        {
          "page": 36,
          "annotations": [
            {
              "text": "Environmental, social and governance standards serve as guiding principles for fund managers in the selection of companies to invest, but these can be broad and don’t necessarily entail divestment. Some ESG data providers have come under scrutiny from pro-Israel groups in recent years for their ratings of companies tied to Israeli’s military operations."
            }
          ]
        },
        {
          "page": 37,
          "annotations": [
            {
              "text": "The “ESG-managed” share of Brown’s investment portfolio now sits at 25%, per the Investment Office’s website. The Office expects that this ESG-managed share will “steadily increase” over time, according to the site."
            },
            {
              "text": "In a 2019 letter to Brown community members, Paxson wrote that the University’s endowment should not be used as a “political tool.” Student activists continue to reference that statement in disagreement, citing the University’s previous divestment decisions as examples of when the endowment has been used as a “political tool.”"
            }
          ]
        },
        {
          "page": 38,
          "annotations": []
        },
        {
          "page": 39,
          "annotations": [
            {
              "text": "Textron’s downtown Providence headquarters has been the site of several protests by local organizers and student activist groups over the past year. In May 2024, RISD students occupied an administrative building to pressure the college into severing ties with Textron and other companies affiliated with Israel."
            }
          ]
        },
        {
            "page": 40,
            "annotations": []
          },
          {
            "page": 41,
            "annotations": []
          },
          {
            "page": 42,
            "annotations": []
          },
          {
            "page": 43,
            "annotations": []
          },
          {
            "page": 44,
            "annotations": []
          },
          {
            "page": 45,
            "annotations": []
          },
          {
            "page": 46,
            "annotations": []
          },
          {
            "page": 47,
            "annotations": []
          },
          {
            "page": 48,
            "annotations": []
          },
          {
            "page": 49,
            "annotations": []
          },
          {
            "page": 50,
            "annotations": []
          },
          {
            "page": 51,
            "annotations": []
          },
          {
            "page": 52,
            "annotations": []
          },
          {
            "page": 53,
            "annotations": []
          },
          {
            "page": 54,
            "annotations": []
          },
          {
            "page": 55,
            "annotations": []
          },
          {
            "page": 56,
            "annotations": []
          },
          {
            "page": 57,
            "annotations": []
          },
          {
            "page": 58,
            "annotations": []
          },
                                      
      ];
   


    // Check if landingSection exists
    if (!landingSection) {
        console.error('Landing section not found.');
        return; // Exit if landingSection does not exist
    }

    // Assume pagesData is defined somewhere
    pagesData.forEach(pageData => {
        const pageElement = document.createElement('div');
        pageElement.classList.add('page');
        pageElement.id = `page-${pageData.page}`;

        const imgElement = document.createElement('img');
        imgElement.src = `pages/report_Page_${String(pageData.page).padStart(2, '0')}.jpg`;
        imgElement.alt = `Page ${pageData.page}`;

        pageElement.appendChild(imgElement);

        // Create a wrapper for annotations
        const annotationWrapper = document.createElement('div');
        annotationWrapper.classList.add('annotation-wrapper');

        pageData.annotations.forEach((annotation, index) => {
            const annotationElement = document.createElement('div');
            annotationElement.classList.add('annotation');
            annotationElement.id = `annotation-${pageData.page}-${index}`;
            annotationElement.innerText = `${index + 1}. ${annotation.text}`;
            annotationElement.style.display = 'none'; // Initially hidden

            annotationWrapper.appendChild(annotationElement);
        });

        // Create and style the scroll indicator
        const scrollIndicator = document.createElement('div');
        scrollIndicator.classList.add('scroll-indicator');
        scrollIndicator.innerText = 'Scroll';
        scrollIndicator.style.position = 'absolute';
        scrollIndicator.style.bottom = '10px';
        scrollIndicator.style.left = '50%';
        scrollIndicator.style.transform = 'translateX(-50%)';
        scrollIndicator.style.width = '80%';
        scrollIndicator.style.textAlign = 'center';
        scrollIndicator.style.padding = '10px 15px';
        scrollIndicator.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        scrollIndicator.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.transition = 'opacity 0.3s ease';
        scrollIndicator.style.fontFamily = 'Roboto, sans-serif';
        scrollIndicator.style.fontSize = '0.8rem';
        scrollIndicator.style.zIndex = '10'; // Ensure it's above other content
        scrollIndicator.style.display = 'none'; // Hide initially

        annotationWrapper.appendChild(scrollIndicator);
        pageElement.appendChild(annotationWrapper);
        documentContainer.appendChild(pageElement);
    });

    setupIntersectionObserver();
    setupLandingObserver();

    function setupIntersectionObserver() {
        const annotations = document.querySelectorAll('.annotation');
        const pages = document.querySelectorAll('.page');
    
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        };
    
        const observerCallback = (entries) => {
            entries.forEach(entry => {
                const visibleAnnotations = entry.target.querySelectorAll('.annotation');
                const scrollIndicator = entry.target.querySelector('.scroll-indicator');
        
                if (entry.isIntersecting) {
                    if (window.innerWidth > 1100) {
                        annotations.forEach(annotation => {
                            annotation.style.display = 'none';
                        });
                        visibleAnnotations.forEach(annotation => {
                            annotation.style.display = 'block';
                        });
        
                        const annotationWrapper = entry.target.querySelector('.annotation-wrapper');
                        const totalHeight = annotationWrapper.scrollHeight;
                        const visibleHeight = annotationWrapper.clientHeight;
        
                        if (totalHeight > visibleHeight) {
                            // Show the scroll indicator initially
                            scrollIndicator.style.display = 'block';
                            scrollIndicator.style.opacity = '1';
        
                            // Check if this wrapper has been scrolled before
                            if (!annotationWrapper.hasAttribute('data-scrolled')) {
                                const handleScroll = () => {
                                    const scrollTop = annotationWrapper.scrollTop;
        
                                    if (scrollTop > 10) {
                                        scrollIndicator.style.opacity = '0';
                                        setTimeout(() => {
                                            scrollIndicator.style.display = 'none';
                                        }, 300);
        
                                        // Mark this wrapper as scrolled
                                        annotationWrapper.setAttribute('data-scrolled', 'true');
        
                                        // Remove the scroll event listener
                                        annotationWrapper.removeEventListener('scroll', handleScroll);
                                    }
                                };
        
                                // Add scroll event to the annotation wrapper
                                annotationWrapper.addEventListener('scroll', handleScroll);
                            } else {
                                // If it has been scrolled before, hide the indicator
                                scrollIndicator.style.display = 'none';
                            }
                        } else {
                            scrollIndicator.style.display = 'none';
                        }
                    } else {
                        annotations.forEach(annotation => {
                            annotation.style.display = 'block';
                        });
        
                        scrollIndicator.style.display = 'none';
                    }
                }
            });
        };
        
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        pages.forEach(page => {
            observer.observe(page);
        });
    }
    
    function setupLandingObserver() {
        const landingObserverOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const landingObserverCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const annotations = document.querySelectorAll('.annotation');
                    annotations.forEach(annotation => {
                        annotation.style.display = 'none'; // Hide all annotations when landing section is visible
                    });
                }
            });
        };

        const landingObserver = new IntersectionObserver(landingObserverCallback, landingObserverOptions);
        landingObserver.observe(landingSection);
    }
});