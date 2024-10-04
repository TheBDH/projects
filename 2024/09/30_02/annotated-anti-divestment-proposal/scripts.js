document.addEventListener('DOMContentLoaded', function() {
    const documentContainer = document.getElementById('document-container');
    const landingSection = document.getElementById('landing');

    // Embedded JSON data
    const pagesData = [
      {
        "page": 1,
        "annotations": [
          {
            "text": "This memo was written in response to a divestment proposal. This week, the Advisory Committee on University Resource Management will release a recommendation as to whether Brown should divest from some companies associated with Israel. Next, the Corporation, the University’s highest governing body, will vote on divestment from 10 companies with ties to Israel at its October meeting, which historically occurs on the third weekend of the month."
          }
        ]
      },
      {
        "page": 2,
        "annotations": [
          {
            "text": "ACURM’s charge states that the committee “shall not recommend any action that advances a position on social or political questions unrelated to the investment or expenditure of University financial resources under consideration.”\n\nACURM is tasked with evaluating the alleged social harm of the investments and weighing the University’s ability to rectify that alleged social harm against other factors, including financial and academic functions. National security is never mentioned in ACURM’s charge."
          },
          {
            "text": "The Corporation vote came after the Brown Divest Coalition, a student group calling for divestment, held a week-long encampment on the Main Green last April. In an agreement that led to the voluntary disbandment of the encampment, Brown agreed to bring a divestment vote to the Corporation in its October meeting. Other protests in support of divestment included an eight day hunger strike and two University Hall sit-ins that resulted in 61 arrests."
          },
          {
            "text": "Israel built the controversial wall along and inside parts of the West Bank following an increased wave of political violence in the early 2000s. The International Court of Justice has stated that the wall violates international law by restricting rights such as freedom of movement, while the Israeli government says the wall is a national security necessity. BDC has pointed to the wall as an example of social harm during its presentation to ACURM and in their divestment proposal."
          },
          {
            "text": "Some officials, including UN Special Rapporteur on the situation of human rights in the Occupied Palestinian Territories Francesca Albanase, have said there are “reasonable grounds” to believe that Israel is committing genocide against Palestinians in Gaza. Others, including American and Israeli officials, have fiercely contested that claim.\n\nThe United Nations has not made an official statement on whether Israel is committing genocide in Gaza. The accusation of genocide is one of the most common and controversial flashpoints in the discourse around divestment."
          },
          {
            "text": "In August, 24 Republican state attorneys general released a letter warning of potential legal action if the Corporation votes to divest from companies with ties to Israel. They cautioned that the vote may trigger anti-BDS laws, which could prevent some states from doing business with Brown. ACURM Chair James Kellner brought up the letter in the committee’s meeting with Brown Divest Coalition representatives."
          },
          {
            "text": "In 2016, Rhode Island passed an anti-BDS law that prevents the state from contracting with companies engaging in some forms of boycott. It is unclear how this law will impact Brown’s ability to divest from the 10 companies identified by the Brown Divest Coalition."
          },
          {
            "text": "This statement echoes previous comments from Paxson. “On very contested issues where there are many different views, we don’t feel it’s appropriate for the University to take sides,” Paxson said in a February interview with The Herald."
          }
        ]
      },
      {
        "page": 3,
        "annotations": []
      },
      {
        "page": 4,
        "annotations": [
          {
            "text": "ACURM’s charge states that it “shall not recommend any action that advances a position on social or political questions unrelated to the investment or expenditure of University financial resources under consideration.”"
          },
          {
            "text": "During a surge in nationwide protests last spring, student activists at dozens of campuses pitched encampments and urged their respective institutions to divest from companies affiliated with Israel. Many of those encampments ended with arrests and forcible disbandment. Brown was one of the few schools to come to an agreement with activists, which saw an end to all BDC-led protests through Commencement in exchange for a vote on divestment in the October Corporation meeting."
          }
        ]
      },
      {
        "page": 5,
        "annotations": [
          {
            "text": "Some student groups, including Brown Students for Justice in Palestine, received heavy criticism for their statements after the October 7 attacks. Several other student organizations released statements of mourning, while many also condemned what they identified as the root causes of the violence, The Herald previously reported."
          }
        ]
      },
      {
        "page": 6,
        "annotations": [
          {
            "text": "In February, Paxson wrote a letter to the 19 student protestors who participated in an eight-day hunger strike. In the letter, Paxson declined the students’ demands for the Corporation to consider divestment, directing them instead to submit a proposal to ACURM. Strikers argued that the proposal process would take too long given the “urgency of the crisis in Gaza,” The Herald previously reported."
          },
          {
            "text": "Brown Concert Agency removed the lineup poster from its Instagram page at the recommendation of the Student Activities Office, The Herald previously reported. The office received complaints from community members alleging the poster was “explicitly antisemitic” or questioning “what the organizers intended to convey about who was welcome at the Spring Weekend concerts,” according to Joie Forte, senior associate dean and director of student activities."
          },
          {
            "text": "In December of last year, two Jewish students received an anonymous note which read, “Those who live for death will die by their own head,” The Herald previously reported."
          },
          {
            "text": "In July, the Office for Civil Rights at the U.S. Department of Education resolved a Title VI Shared Ancestry complaint filed against the University that alleged an inadequate response to antisemitism on campus. As part of the resolution of the complaint, the University agreed to a list of actions to improve its response to harassment and discrimination."
          },
          {
            "text": "Brown’s Green Space Policy, issued by the University in October 2011, prohibits “events involving encampments on Historical Greens or residential quadrangles.” Provost Fancis Doyle highlighted that students involved could face disciplinary action in a community-wide email"
          }
        ]
      },
      {
        "page": 7,
        "annotations": []
      },
      {
        "page": 8,
        "annotations": []
      },
      {
        "page": 9,
        "annotations": []
      },
      {
        "page": 10,
        "annotations": [
          {
            "text": "As part of its deliberation process, ACURM organized two public forums for Brown community members to share perspectives on divestment and ask questions to the committee’s chair, James Kellner. During the meetings, which occurred earlier in September, attendees asked Kellner to clarify how ACURM defined “social harm.” \n\nKellner did not provide a definition. “We have no list of things that we say are social harms. We have no set of things that we say count more than” others, he said. Kellner emphasized that the committee’s charge is to determine whether Brown’s potential investment in the 10 companies identified by the Brown Divest Coalition contribute substantially to grave social harm."
          }
        ]
      },
      {
        "page": 11,
        "annotations": []
      },
      {
        "page": 12,
        "annotations": []
      },
      {
        "page": 13,
        "annotations": [
          {
            "text": "Gaza was previously home to 12 universities, though all of them have been destroyed over the course of the war. The most recent university to fall was Al-Israa University, which was bombed by Israeli forces on Jan. 17."
          },
          {
            "text": "ACURM is tasked with considering whether Brown’s investments and expenses are “conducted with ethical and moral standards consistent with the University’s mission and values.”"
          },
          {
            "text": "In an April Q&A with Jane Dietze, Brown’s chief investment officer and the vice president of finance and administration, she emphasized that the vast majority of Brown’s endowment is managed externally, which could limit the impact of divestment given the University’s scant direct holdings. “Given today’s realities, it’s not possible to divest the way Brown did in South Africa or Sudan,” Dietze said at the time."
          },
          {
            "text": "In the divestment proposal that BDC presented to the Corporation in May, organizers “identified ten primarily aerospace and defense technology companies ‘complicit in grave human rights violations,’” The Herald previously reported. One of these companies was RTX Corporation, the parent company of Raytheon. While Lockheed Martin was not one of the ten companies that BDC identified, their proposal defines it as a “major weapons manufacturer.”"
          }
        ]
      },
      {
        "page": 14,
        "annotations": [
          {
            "text": "In a speech at the Hillel International Israel Summit in 2023, Paxson expressed her belief that universities should “encourage open dialogue on contentious issues such as Israel-Palestine,” The Herald previously reported. Taking a formal stance on the issue “would undermine Brown’s primary mission of advancing knowledge and understanding,” she said at the time."
          },
          {
            "text": "On Oct. 25, 2023, around 500 Brown students participated in a nationwide walkout calling for an end to the war in Gaza, The Herald previously reported. While circling University Hall, protesters led several chants, including “from the river to the sea, Palestine will be free.” While the slogan has been used by pro-Palestine activists across the world, some Jewish groups believe the sentence shows support for the destruction of Israel."
          }
        ]
      },
      {
        "page": 15,
        "annotations": [
          {
            "text": "In 2023, the Office of Institutional Equity and Diversity launched the Campus Climate Survey in an attempt to “better understand the living, working and learning environments of students, staff and faculty at Brown,” The Herald previously reported. While the survey did not identify specific religious groups, 30% of undergraduate respondents reported experiencing an incident of bias, and 26% of this group believed the incident was motivated by their religious identity."
          }
        ]
      },
      {
        "page": 16,
        "annotations": [
          {
            "text": "BDC’s proposal notes that past precedent can help us “make informed decisions about the best response in cases of urgent social harm.” They later add that “Due to Brown’s significant social influence, divestment campaigns like those against Sudan and South Africa were also effective in socially stigmatizing the human rights violations carried out in those countries.”"
          },
          {
            "text": "On Sept. 9, 2004, Former US Secretary of State Colin Powell testified to the Senate Foreign Relations Committee that “genocide has been committed in Darfur” and concluded that the Sudanese government was one of the parties bearing responsibility.\n\nOn Feb. 25, 2006, the Corporation voted to “divest its investments from companies whose business activities can be shown to be supporting and facilitating the Sudanese government in its continuing sponsorship of genocidal actions and human rights violations in Darfur.”"
          },
          {
            "text": "In Feb. 1986, the Brown Corporation “voted to divest itself from all companies doing business in South Africa within one year, if they do not comply with the Sullivan Principles, and to review its investment policies in two years,” according to the University library’s website. Students continued to protest following this partial divestment."
          }
        ]
      },
      {
        "page": "",
        "annotations": []
      },
      {
        "page": 17,
        "annotations": [
          {
            "text": "After appearing in front of this committee, four university presidents have stepped down. This includes the presidents of UPenn, Harvard, Columbia and Rutgers."
          },
          {
            "text": "President Christina Paxson has used similar verbiage when discussing Brown’s role, promoting it as a space for free inquiry rather than a political institution."
          }
        ]
      },
      {
        "page": 18,
        "annotations": []
      },
      {
        "page": 19,
        "annotations": [
          {
            "text": "The BDS website states that its goal is “to end international support for Israel’s oppression of Palestinians and pressure Israel to comply with international law.”"
          }
        ]
      },
      {
        "page": 20,
        "annotations": [
          {
            "text": "According to the citation provided, SJP may be linked to organizations accused of funding Hamas, although those allegations have not been proven. There is unresolved controversy regarding the funding sources for the National SJP."
          }
        ]
      },
      {
        "page": 21,
        "annotations": [
          {
            "text": "The share of direct investments in Brown’s endowment has dropped significantly since the 80s, while the endowment has grown. Brown’s endowment was worth $111 million in June 1982, The Herald previously reported. At the time, more than 21% of the University’s endowment was directly invested in companies operating in South Africa, and student activists called on the Corporation to drop these holdings from the endowment entirely. Today, Brown only invests 4% of its endowment in direct holdings like stocks."
          },
          {
            "text": "The BDC divestment proposal advocates for integrating divestment into existing Environmental, Social, Governance (ESG) standards."
          },
          {
            "text": "Thirty-eight states have adopted some form of anti-boycott legislation, which state attorneys general have warned could put Brown in legal jeopardy if the Corporation votes to divest."
          }
        ]
      },
      {
        "page": 22,
        "annotations": [
          {
            "text": "Brown’s Investment Office has stated that the University does not hold any direct investments in weapons manufacturing companies, but the Office is contractually prohibited from disclosing the content of third-party managers’ portfolios that manage 96% of the endowment."
          },
          {
            "text": "After the Corporation partially divested from South Africa, University administrators said that Brown had lost $7.5 million as a result of divestment. At the time, the endowment was worth less than $400 million."
          }
        ]
      },
      {
        "page": 23,
        "annotations": [
          {
            "text": "In its proposal, the BDC argues that its criteria for divestment would not constitute a “boycott” under HB-7736 and that Rhode Island’s anti-boycott law would therefore not be applicable. The law’s definition of “boycott” requires the action to be based on the “race, color, religion, gender, or nationality” of the targeted business or financial entity."
          }
        ]
      },
      {
        "page": 24,
        "annotations": [
          {
            "text": "In a Wall Street Journal op-ed announcing his resignation from the Corporation in early September, former Trustee Joseph Edelman criticized the University’s decision to hold an October vote on divestment from companies with ties to Israel in exchange for an agreement with pro-divestment demonstrators to dismantle an encampment on the campus green. President Christina Paxson P’19 P’MD’20 responded, writing that the process being followed is standard and not a direct response to student activism."
          }
        ]
      },
      {
        "page": 25,
        "annotations": []
      },
      {
        "page": 26,
        "annotations": []
      },
      {
        "page": 27,
        "annotations": []
      },
      {
        "page": 28,
        "annotations": []
      },
      {
        "page": 29,
        "annotations": []
      },
      {
        "page": 30,
        "annotations": []
      },
      {
        "page": 31,
        "annotations": []
      },
      {
        "page": 32,
        "annotations": []
      },
      {
        "page": 33,
        "annotations": []
      },
      {
        "page": 34,
        "annotations": []
      },
      {
        "page": 35,
        "annotations": []
      },
      {
        "page": 36,
        "annotations": []
      },
      {
        "page": 37,
        "annotations": []
      },
      {
        "page": 38,
        "annotations": []
      },
      {
        "page": 39,
        "annotations": []
      }
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
        imgElement.src = `pages/document_Page_${String(pageData.page).padStart(2, '0')}.jpg`;
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
