const messages = [
  {
    name: "Lauren Zalaznick '84",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote:
      "We did the best job possible under the worst circumstances possible.",
    message:
      "We did the best job possible under the worst circumstances possible. The money spent towards supporting local organizations over ten years is great on its own, and helps us with community relations while not funding the Trump administration. Brown’s administration has stayed out of the limelight and out of Washington, while protecting the students, mission and values of the University.",
  },
  {
    name: "Joyce Cohen Bedine '66",
    affiliation: "Alumni",
    approval: "strongly disapprove",
    pullQuote:
      "It really hurts our future as a democracy to see all these wonderful institutions of higher learning bend a knee to despotism.",
    message:
      "It really hurts our future as a democracy to see all these wonderful institutions of higher learning bend a knee to despotism. Couldn't all of these universities banded together and refused to be complicit to the Trump administration’s attack on our rights? Maybe they could have survived at least as long as it would have taken for Trump to see that he did not have the power he was taking from all of us. My father fought in World War II for freedom from tyranny, and now it is coming back.",
  },
  {
    name: "Charles Morin '76",
    affiliation: "Alumni",
    approval: "strongly disapprove",
    pullQuote: "I'm sad that Brown caved under fascist Trump.",
    message: "I'm sad that Brown caved under fascist Trump.",
  },
  {
    name: "Jon Vacura",
    affiliation: "Providence community",
    approval: "strongly disapprove",
    pullQuote:
      "The Trump administration has broken Brown, and they will have more demands.",
    message:
      "It’s extremely ignorant to assume that this capitulation will be enough. Once you give in it’s over: A cursory examination of the history of authoritarianism will make that obvious. The Trump administration has broken Brown, and they will have more demands.",
  },
  {
    name: "Anna Murphy",
    affiliation: "Staff",
    approval: "strongly disapprove",
    pullQuote:
      "The deal between Brown and the Trump administration is undeniably a protection racket, and the price Brown paid has compromised the safety of Brown’s transgender community.",
    message:
      "The deal between Brown and the Trump administration is undeniably a protection racket, and the price Brown paid has compromised the safety of Brown’s transgender community. Even beyond this, Brown’s capitulation makes the institution feel increasingly like an extension of the Trump administration itself, which directly undermines the University's mission while also creating a chilling effect on the kinds of research Brown’s staff, faculty and students can engage in.",
  },
  //   {
  //     name: "Alexander Green '99",
  //     affiliation: "Alumni",
  //     approval: "strongly approve",
  //     pullQuote: "...the Trump administration has created a new normal.",
  //     message:
  //       "I thought the agreement was a good compromise that didn't give away too much or accept terms from the government which would have compromised the academic integrity of the University. It stinks that Brown was in this position in the first place but we have to accept, to some extent, that the Trump administration has created a new normal. ",
  //   },
  {
    name: "Jane Lancaster, PhD'98, Adjunct faculty in History Department",
    affiliation: "Alumni",
    approval: "neither approve nor disapprove",
    pullQuote:
      "I am concerned about Brown's efforts to pay for the settlement, including the potential sale/redevelopment of 20 Olive St., which was, for over a hundred years, the home of the Providence Shelter for Colored Children.",
    message:
      "I am concerned about Brown's efforts to pay for the settlement, including the potential sale/redevelopment of 20 Olive St., which was, for over a hundred years, the home of the Providence Shelter for Colored Children. Originally founded in 1838, the Shelter — which still exists as a fund to help local children of color — is one of the oldest continuous charities in Rhode Island. That history should not be ignored.",
  },
  //   {
  //     name: "Nicole Collins PhD 2030",
  //     affiliation: "Student",
  //     approval: "strongly disapprove",
  //     pullQuote:
  //       "You cannot negotiate with fascists; fascism will eat up everything in its path.",
  //     message:
  //       "I am a trans woman and a PhD student here, studying LGBTQ+ issues in the U.S. I am appalled by the deal with the government and am worried that I will personally be discriminated against — and that my research will be curtailed and possibly halted — due to Brown’s complicity with the Trump administration. I am one of many minorities Paxson has thrown away with this deal, and I will not remain quiet about this capitulation to fascism, even if it got us a momentary gain. You cannot negotiate with fascists; fascism will eat up everything in its path. It will only be a short time until Brown hands the names and contact information of dissidents over to the government.",
  //   },
  {
    name: "Eileen Rudden '72",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote:
      "Although I despise Trump, this was a sensible agreement to follow current federal law and restore research funding.",
    message:
      "Although I despise Trump, this was a sensible agreement to follow current federal law and restore research funding. Brown will be supporting workforce development for its biomedical projects anyway. Kudos to Christina Paxson in a difficult environment.",
  },
  {
    name: "Carla Ferrari '82",
    affiliation: "Alumni",
    approval: "somewhat disapprove",
    pullQuote:
      "I wish the University had held out and let this play out over a few years to retain their reputation.",
    message:
      "I'm very disappointed. I felt pride in the resistance of the University and the way they had handled some of the conflict over this issue. I wish the University had held out and let this play out over a few years to retain their reputation. Now they have capitulated to this dictatorship, and I feel this is the wrong reaction. I think handling the short-term suffering would have been difficult, but in the long run, the better solution.",
  },
  {
    name: "Vinny Egizi '88",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote:
      "I fully support the Brown administration’s agreement to improve its actions to stop the harassment of the Jewish community on campus.",
    message:
      "I fully support the Brown administration’s agreement to improve its actions to stop the harassment of the Jewish community on campus. It is a shame that Brown allowed the intimidating and harassing Free Palestine protests to occur on campus with no action to stop it. It is also a good step forward to eliminate diversity-based admissions and University programming.",
  },
  {
    name: "Emma Gardner '24",
    affiliation: "Alumni",
    approval: "strongly disapprove",
    pullQuote:
      "I am revolted by the deal Brown has struck with the Trump administration, and particularly its cowardly attacks on its own trans students, particularly trans women.",
    message:
      "I am revolted by the deal Brown has struck with the Trump administration, and particularly its cowardly attacks on its own trans students, particularly trans women. The University should know its deal will do little to protect them from a hostile and capricious president.\nWhen I transitioned at Brown, I struggled with intense family rejection, the indignities of social and medical transition, isolation and rising political attacks on my community — on top of the normal stress of a rigorous college workload. Now, trans students will also have to worry about whether Trump’s executive orders apply to the bathrooms in their libraries, dormitories and lecture halls. There are already few trans women at the University, and Brown’s explicitly hostile concessions will further marginalize students who disproportionately experience discrimination and financial hardship.\nThe University played a critical role in the current anti-trans fervor by popularizing shoddy claims about “social contagion” in 2018. Now, the movement Brown helped to fuel is harming some of its most vulnerable students. I will not be donating to, or otherwise supporting the University, going forward.",
  },
  //   {
  //     name: "Nancy Lee",
  //     affiliation: "Parent/guardian",
  //     approval: "strongly approve",
  //     pullQuote:
  //       "Brown is handling this unprecedented situation and these difficult times as well as possible.",
  //     message:
  //       "Brown is handling this unprecedented situation and these difficult times as well as possible.",
  //   },
  {
    name: "Kevin Seaman '69",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote:
      "Brown was smart and practical in accepting the terms of the 2025 reality with which it must adapt to after decades of leftist policies.",
    message:
      "Brown was smart and practical in accepting the terms of the 2025 reality with which it must adapt to after decades of leftist policies. Brown could not afford to forfeit $510 million in federal grants and forgo future aid in the face of its fiscal crisis. Society no longer regards the Ivies as special or entitled. Trump’s regard for the Ivies reflects, to a great degree, that of the nation. I suspect this will be a change transcending the current presidential administration. The outrage of alums to this alleged capitulation reflects the degree to which Brown has lost its way in its failure to recognize the fatality of the sociopolitical course it chose. Ironically, Brown was never antisemitic but has been cast into that cohort as a result of its reputation as being one of the most left-wing institutions in the nation. With that in mind, I believe the University got off easy. Brown will have to become “ever true” to institutional values that are grounded in a recognition that all political views and platforms need to be respected.",
  },
  {
    name: "Amy Cohen",
    affiliation: "Staff",
    approval: "somewhat approve",
    pullQuote:
      "I hope we can work together to show our continued support for our transgender and nonbinary community and make it explicitly clear that any direct confrontation with others would be considered harassment and against Brown's policies.",
    message:
      "I feel a lot of relief and gratitude that President Christina Paxson P’19 P’MD’20 was able to broker an agreement that, to a large extent, stayed true to Brown's mission and to our community. The one point troubling me is the adoption of the federal definitions of gender and the impact it has on our transgender and nonbinary community. This seems to validate the current administration’s weaponization of the issue, and I worry that it might embolden someone at Brown with discomfort around gender identity to take it upon themselves to police bathroom use. I hope we can work together to show our continued support for our transgender and nonbinary community and make it explicitly clear that any direct confrontation with others would be considered harassment and against Brown's policies.",
  },
  //   {
  //     name: "Donna Schmidt P'21",
  //     affiliation: "Parent/guardian",
  //     approval: "strongly disapprove",
  //     pullQuote:
  //       "I wish my daughter, who graduated in 2021, had chosen to attend a school with the integrity to stand up to oppression.",
  //     message:
  //       "I wish my daughter, who graduated in 2021, had chosen to attend a school with the integrity to stand up to oppression. Caving for money shows an utter lack of commitment to what I thought Brown stood for.",
  //   },
  {
    name: "Francois Luks",
    affiliation: "Faculty",
    approval: "somewhat approve",
    pullQuote:
      "The school seems to bet that it will outlive this cruel, short-sighted, racist, isolationist and erratic administration.",
    message:
      "There is a spectrum from principled suicide to cowardice, and from calculated cynicism to pragmatism. Brown didn’t die on this hill, but it did not roll over either. The reality is that the problem was not one of Brown’s making, and any decision would have been met with criticism, jeopardized programs and negatively affected people. Brown has been around for more than 250 years and has survived authoritarianism before. The school seems to bet that it will outlive this cruel, short-sighted, racist, isolationist and erratic administration. The odds are pretty good.",
  },
  {
    name: "Christopher Morin MD'75",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote:
      "The agreement should not have been necessary. Brown did nothing that was wrong.",
    message:
      "The agreement should not have been necessary. Brown did nothing that was wrong. In the many years I was at Brown, I have never been prouder of how the University administration, and the whole Brown community, grappled with difficult issues. I spent twenty-two years at Brown as both a student and a member of the clinical faculty. I served on the Board of Directors of the Brown Medical Alumni Association for 17 years.\nI do believe that the agreement is fair and the best that could have been negotiated.\nBrown has never been systematically antisemitic. The medical school was founded by many of Jewish faith. The oath of the physician at Brown has as much input from the Oath of Maimonides as any other source. I should know — I was on the committee that wrote the oath.",
  },
  {
    name: "Rev. Peter Laarman '70",
    affiliation: "Alumni",
    approval: "neither approve nor disapprove",
    pullQuote:
      "The very idea of having to strike a deal with this White House is abhorrent, especially when Brown's alleged “discrimination” is a baseless and trumped up canard.",
    message:
      "The proof will be in the pudding. We don’t yet know enough about the precise definitions of “merit-based” admissions and hiring decisions. No institution expects to come out unscathed when a mafia-like administration puts a gun to its head. But settlements reached under such circumstances are ugly by definition. The very idea of having to strike a deal with this White House is abhorrent, especially when Brown's alleged “discrimination” is a baseless and trumped up canard.",
  },
  {
    name: "Stefan Lutschg '24",
    affiliation: "Alumni",
    approval: "strongly disapprove",
    pullQuote:
      "Agreeing to be surveilled by the government will have severe long-term consequences for Brown, and Brown has chosen to forsake its trans and non-binary community all for $50 million, which is meager in comparison to the institution’s endowment.",
    message:
      "I genuinely wish that the Trump administration had found something “wrong” so that Brown would actually take a stand and defend itself. President Paxson’s email outright stating the question “If there was no finding of wrongdoing against Brown, then why negotiate an agreement?” is absolutely laughable because of how short sighted this agreement is. Agreeing to be surveilled by the government will have severe long-term consequences for Brown, and Brown has chosen to forsake its trans and non-binary community all for $50 million, which is meager in comparison to the institution’s endowment.",
  },
  {
    name: "Jainisa Baudin '29",
    affiliation: "Student",
    approval: "somewhat disapprove",
    pullQuote:
      "Many of us are scared — especially incoming freshman and those who are members of minority communities",
    message:
      "Many of us are scared — especially incoming freshman and those who are members of minority communities. I want to trust Brown's administration, but we are in a time where students are threatened, especially BIPOC and LGBTQ+ students. I am dissapointed in our administration because they knew what this concession would look like, but I am praying that I chose the best school to deal with a situation like this.",
  },
  {
    name: "John Peracchio '82",
    affiliation: "Alumni",
    approval: "strongly approve",
    pullQuote: "It's a great deal. The administration is to be commended.",
    message: "It's a great deal. The administration is to be commended.",
  },
  {
    name: "Jenny Cortez",
    affiliation: "Parent/guardian",
    approval: "strongly disapprove",
    pullQuote: "If those who know better kneel, who will stand?",
    message:
      "I'm disappointed. If those who know better kneel, who will stand? They immediately went after other universities.",
  },
  //   {
  //     name: "Scott Whall",
  //     affiliation: "Parent/guardian",
  //     approval: "strongly disapprove",
  //     pullQuote:
  //       "The amount of kowtowing by colleges and universities at this time is truly upsetting.",
  //     message:
  //       "Frankly, I'm very disappointed. The amount of kowtowing by colleges and universities at this time is truly upsetting. This will only pave the way for his movement to fully control speech, academics and the free-thinking that made this nation great.  I was hoping for a stronger union against this oppression among the Ivy League members, but with half settling with this administration (that is SCARED of higher education), I think Paxson's acquiescence will only make this decision look much worse in the years to come.",
  //   },
  {
    name: "Ryan Spinney MPA'26",
    affiliation: "Student",
    approval: "strongly disapprove",
    pullQuote:
      "While I understand Brown's urgent need for funding, it shows that the federal government can pressure educational institutions to submit, setting a troubling new precedent for both this and future administrations.",
    message:
      "It's deeply disheartening that President Paxson compromised Brown's principles to secure resumed funding. While I understand Brown's urgent need for funding, it shows that the federal government can pressure educational institutions to submit, setting a troubling new precedent for both this and future administrations. Brown has an endowment that could allow it to weather financial damages if it refused an agreement. Since Brown compromised despite having the financial resources to do otherwise, it clearly sets a precedent for other smaller and less endowed schools. Essentially, it sends a message to other American institutions: if Brown, with its vast resources, wouldn't stand up to the federal government, then why should we?",
  },
  {
    name: "Irene Sudac '81 P'17",
    affiliation: "Alumni",
    approval: "somewhat approve",
    pullQuote:
      "Caving to a bully doesn't guarantee that the bully won't renege or come back for more.",
    message:
      "I have mixed feelings regarding the agreement. Caving to a bully doesn't guarantee that the bully won't renege or come back for more. On the other hand, the school needs greater certainty to plan for the year ahead and research must be reinstated to keep Brown at the forefront of top universities.",
  },
  {
    name: "David Parker '69 P'12",
    affiliation: "Alumni",
    approval: "somewhat approve",
    pullQuote:
      "I assume and believe that, despite its much weaker bargaining position relative to the federal administration, Brown struck the best deal possible.",
    message:
      "I assume and believe that, despite its much weaker bargaining position relative to the federal administration, Brown struck the best deal possible. Brown appears to have given very little, if anything, and agreed to no changes it was not already making or ready to make. In doing so, it eliminated an existential risk, avoided substantial legal costs and removed a major distraction from its mission. That said, I am sorry that Brown was forced to settle this matter, rather than stand on principle, and am concerned that there may be no effective way to prevent the counterparties from making further demands or otherwise violating their obligations.",
  },
  //   {
  //     name: "Ronald Wilson",
  //     affiliation: "Providence community",
  //     approval: "neither approve nor disapprove",
  //     pullQuote: "The agreement is the lesser of two evils...",
  //     message:
  //       "The agreement is the lesser of two evils, and avoids further significant harm to the University's academic and research objectives.",
  //   },
  {
    name: "Benjamin Daniel '29",
    affiliation: "Student",
    approval: "strongly disapprove",
    pullQuote:
      "To me, this represents a policy of appeasement that weakens the independence of the University.",
    message:
      "I am incredibly disappointed, but not surprised. I am an incoming student who has just decided to make Brown my home for the next four years. At Brown, I hoped to find a community built on common care. Brown to me represented a place where curiosity could thrive. I fear that this current strategy endangers that vision. To me, this represents a policy of appeasement that weakens the independence of the University. Even if Brown maintains a policy of independence in the text of the agreement, we are now in a world where the federal government has successfully demanded change by threatening a revocation of funding. Once this line has been crossed, who’s to say it won’t be crossed again? I recognize that federal grants are essential to maintain the groundbreaking research we conduct on campus, but this should not come at the cost of our transgender friends and neighbors. I suspect the full ramifications of this decision have yet to be felt. This is a new reality for the University — one I hope students will face with renewed vigilance and kindness.",
  },
  {
    name: "Carol Landau '70 P'09, emerita faculty",
    affiliation: "Alumni",
    approval: "somewhat disapprove",
    pullQuote:
      "It’s tragic that Brown has sacrificed the needs of transgender students, given our long history of welcoming diversity on campus.",
    message:
      "It’s tragic that Brown has sacrificed the needs of transgender students, given our long history of welcoming diversity on campus. I don’t envy any university administrator, given this enormous stress. But negotiating with a bully never works. I’m quite sure that students, upon their return to campus, will protest the starvation in Gaza, as they should. But given that this administration equates any criticism of Israeli Prime Minister Benjamin Netanyahu’s actions with antisemitism, it’s likely that false accusations of antisemitism will lead to additional sanctions. I’m not sure I see a way out, short of all universities banding together to fight authoritarianism.",
  },
  {
    name: "Adit Sabnis GS",
    affiliation: "Student",
    approval: "strongly disapprove",
    pullQuote:
      "Brown postures itself as being progressive, yet they so easily threw trans people under the bus to capitulate.",
    message:
      "I am shocked and horrified. Brown postures itself as being progressive, yet they so easily threw trans people under the bus to capitulate. As a neuroscientist, myopic definitions of gender and sex are absolutely unscientific. By capitulating to Trump's demands, not only are our administrators promoting a harmful and false view of gender, but they are readily endangering the lives of so many students, staff and faculty who will be forced to make decisions based on Trump's gender definitions, which Brown has now affirmed.",
  },
  {
    name: "Andrew Clark GS",
    affiliation: "Student",
    approval: "strongly disapprove",
    pullQuote:
      "Our administrators are delusional if they think this is the end of Trump’s attacks against Brown and higher education.",
    message:
      "Brown’s administration sold us out. They threw trans students under the bus. They are acting as if they won, but they accepted horrific concessions to student safety and to academic freedom. Worse still, the White House could come back and demand more concessions, as they did with Columbia. Our administrators are delusional if they think this is the end of Trump’s attacks against Brown and higher education.",
  },
  {
    name: "David Grossman '89",
    affiliation: "Alumni",
    approval: "somewhat approve",
    pullQuote:
      "While no deal is the preferred outcome, the deal agreed to is reasonable for Brown.",
    message:
      "While no deal is the preferred outcome, the deal agreed to is reasonable for Brown. One remaining concern is longevity. What is preventing Trump from changing the deal or seeking a new one in the future?",
  },
  {
    name: "Brandon Yu '28",
    affiliation: "Student",
    approval: "somewhat disapprove",
    pullQuote:
      "There are dozens of transgender and nonbinary students who are a vital part of the Brown community, and I believe it is wrong to sell out their wellbeing to appease some far right ideologues and think tanks.",
    message:
      "I identify as a moderate and disagree with some of the liberal policies other Brown students champion. I like to view both sides of every issue and approach it with nuance rather than submitting to peer pressure. However, there is one part of the agreement that I have a serious problem with, which is the University’s recognition of Executive Order 14168, an order that defines people by their sex assigned at birth, which in many cases is not just disrespectful but also disruptive to people who may not have fit that gender for years, if not decades. There are dozens of transgender and nonbinary students who are a vital part of the Brown community, and I believe it is wrong to sell out their wellbeing to appease some far right ideologues and think tanks. I don’t have a problem with some of the provisions but because this settlement contains a direct attack on innocent people who already face the hardship of being born into a gender to which they don’t belong, I must express serious disapproval with this settlement.",
  },
  //   {
  //     name: "Nathaniel Goodman '84",
  //     affiliation: "Alumni",
  //     approval: "somewhat approve",
  //     pullQuote:
  //       "...I think the end result is as good as could be hoped and seems largely cosmetic.",
  //     message:
  //       "While I'm disappointed that these policy adjustments have to come in conjunction with a supposed \"deal\" with this administration's bullying tactics, I think the end result is as good as could be hoped and seems largely cosmetic.",
  //   },
  {
    name: "Lorraine Fryer '09",
    affiliation: "Alumni",
    approval: "somewhat disapprove",
    pullQuote:
      "I feel that Brown has relinquished important principles, and capitulating to bullies only leads to more bullying.",
    message:
      'Disappointment. I understand that it was probably an increasingly fraught situation vis-a-vis funding and potentially having to let go of researchers. Nevertheless, I feel that Brown has relinquished important principles, and capitulating to bullies only leads to more bullying. Capitulating to facism only leads to more facism. If Brown launched a fundraising campaign as a response to funding being frozen, I would probably have donated more than I really can afford at this time. (I was laid off from my job of almost 8 years due to funding difficulties. I still say that we need to give a hard "not on my watch" to this administration.)',
  },
  //   {
  //     name: "Tim Fick",
  //     affiliation: "Parent/guardian",
  //     approval: "somewhat disapprove",
  //     pullQuote:
  //       "I was surprised that a deal was made and disappointed at the concessions given by Brown.",
  //     message:
  //       "I was surprised that a deal was made and disappointed at the concessions given by Brown. However, I understand the financial constraints Brown is facing and the need to arrive at an agreement with the government. Yet, what if the government demands more now that Brown conceded?",
  //   },
  {
    name: "Jianye Hu P'28",
    affiliation: "Parent/guardian",
    approval: "somewhat approve",
    pullQuote:
      "Brown should do something further to defend the values our nation has been holding.",
    message:
      "It was the darkest moment in my life, but I completely understand Brown's consideration of the priority and standing points. My family immigrated from a dictatorship, and we are feeling familiar with the current atmosphere around this country. Brown has been a lighthouse in my daughter's eyes, in many ways of liberty and freedom. I don't like to see that it lets her down. Brown should do something further to defend the values our nation has been holding.",
  },
  {
    name: "Alexander Caicedo '29",
    affiliation: "Student",
    approval: "somewhat disapprove",
    pullQuote:
      "This direct attack on the very existence of Brown University, a 260-year-old symbol of American and global greatness, simply demanded a more powerful response than appeasement. ",
    message:
      "I recognize that federal funding is essential to the University, which means that Brown really had no other choice but to listen to the Trump administration’s demands, and all considered, the deal was positive – especially if compared to those of other Ivy League institutions. Still, I cannot help but feel extremely disappointed by our leadership’s utter lack of fighting spirit. This direct attack on the very existence of Brown University, a 260-year-old symbol of American and global greatness, simply demanded a more powerful response than appeasement. Not only did we shamefully give up our trans students, but we directly refused to pose any resistance, instead actively and voluntarily pursuing an agreement with our aggressor. Sure, we may have gotten our funding back mostly unscathed, but we have also told the entire world that America’s most historical and powerful universities are not willing to oppose President Trump’s authoritarian behaviors. Extreme disillusionment fills my heart, because if our democracy really is inevitably destined to fall, I at least hoped for some resistance. I move forward, saddened that a single man can destroy my everyday reality, and terrified that the next community to be considered expendable may be mine.",
  },
  {
    name: "Judith Beckman",
    affiliation: "Providence community",
    approval: "strongly disapprove",
    pullQuote:
      "To have the University brought to heel by a corrupt administration whose agenda is one of repression of free speech and hatred of progressive ideals is more than just disturbing.",
    message:
      "My reaction? Tremendous sadness and upset. Brown has been, for years, a beacon of liberal education for the entire country. To have the University brought to heel by a corrupt administration whose agenda is one of repression of free speech and hatred of progressive ideals is more than just disturbing. It is a path that spells disaster for our institutions of higher learning and for our country, whose successful future is fully linked to an open society. This is truly terrible.",
  },
];

const cardContainer = document.querySelector(".card-container");
const body = document.querySelector("body");

messages.forEach((person, index) => {
  const card = document.createElement("div");
  card.className = "card";
  card.setAttribute("onclick", `openModal(${index})`);
  card.setAttribute("data-affiliation", person.affiliation);
  card.setAttribute("data-approval", person.approval);
  card.innerHTML = `
    <div class="card-header">
      <div class="card-title">${person.name},</div>
      <div class="card-affiliation">${person.affiliation}</div>
    </div>
    <p>${person.pullQuote}</p>
    <div class="card-approval">${person.approval}</div>
  `;
  cardContainer.appendChild(card);

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.id = `modal${index}`;
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close" onclick="closeModal(${index})">&times;</span>
      <div class="text-container">
        <div class="card-title">${person.name},</div>
        <p class="full-quote">${person.message}</p>
        <div class="card-title" style="text-align: right;">${person.affiliation}</div>
      </div>
    </div>
  `;
  body.appendChild(modal);
});

function openModal(index) {
  document.getElementById("modal" + index).style.display = "block";
  document.getElementById("page-content").classList.add("blurred");
}

function closeModal(index) {
  document.getElementById("modal" + index).style.display = "none";
  document.getElementById("page-content").classList.remove("blurred");
}

window.onclick = function (event) {
  for (let i = 0; i < messages.length; i++) {
    const modal = document.getElementById("modal" + i);
    if (event.target === modal) {
      modal.style.display = "none";
      document.getElementById("page-content").classList.remove("blurred");
    }
  }
};

let filters = ["All"];

function updateActiveTags() {
  const container = document.querySelector(".active-tags-container");
  container.innerHTML = "";

  if (filters.includes("All")) return;

  filters.forEach((filter) => {
    const tag = document.createElement("span");
    tag.className = "active-tag";
    tag.innerHTML = `${filter} <span class="remove-tag">&times;</span>`;
    container.appendChild(tag);
  });
}

function filterCards(type) {
  const cards = document.querySelectorAll(".card");
  const buttons = document.querySelectorAll(".filter-buttons button");

  if (filters.includes("All") || type === "All") {
    filters = [type];
    buttons.forEach((btn) => btn.classList.remove("active"));
    document
      .querySelector(`.filter-buttons button[onclick*="${type}"]`)
      .classList.add("active");
  } else if (filters.includes(type)) {
    filters = filters.filter((filter) => filter !== type);
    document
      .querySelector(`.filter-buttons button[onclick*="${type}"]`)
      .classList.remove("active");
  } else {
    filters.push(type);
    document
      .querySelector(`.filter-buttons button[onclick*="${type}"]`)
      .classList.add("active");
  }

  if (filters.length === 0) {
    filters = ["All"];
    document
      .querySelector(`.filter-buttons button[onclick*="All"]`)
      .classList.add("active");
  }

  buttons.forEach((btn) => {
    const btnType = btn.id;
    if (filters.includes(btnType)) {
      btn.classList.add("active");
      if (btnType !== "All") {
        btn.innerHTML = `${btnType} <span class="close-tag" onclick="removeTag(event, '${btnType}')">&times;</span>`;
      } else {
        btn.innerHTML = "All";
      }
    } else {
      btn.classList.remove("active");
      btn.innerHTML = btnType;
    }
  });

  cards.forEach((card) => {
    const affiliation = card.getAttribute("data-affiliation");
    if (
      type === "All" ||
      filters.includes("All") ||
      filters.includes(affiliation)
    ) {
      card.classList.remove("hidden");
    } else {
      card.classList.add("hidden");
    }
  });

  updateActiveTags();
}
