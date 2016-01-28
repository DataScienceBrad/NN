## Contribution Guidelines
This project is used by MAQ Software Engineering team to build Custom visualizations that ship to Power BI Visual [Power BI Visuals](http://powerbi.com/visuals).  

####Third party libraries
External libraries of the PowerBI-Visuals project are located in folders:

1.	"\src\Clients\Externals\ThirdPartyIP" - this folder contains main third party libraries used in this project
2.	"node_modules" folders - these folders contain plugins used by gulp build system.

Some libraries are licensed in a way that prevents us for shipping them in our production environment. So we might decline your pull request should that happen. If your contribution changes require adding or modifying a new 3rd party library, then you should contact the Power BI team first and get approval for it. Submit an issue clearly identifying the library and version to start the process. This process takes at least 3 weeks for internal review.

####Pull Request Checklist
Pull Requests need to adhere to the checklist below. The Power BI team may ask you to make changes before accepting your changes.

##### Coding guidelines

  All changes should follow our adopted coding guidelines. A detailed description of our coding guidelines can be found [here](https://github.com/Microsoft/PowerBI-visuals/wiki/Coding-Guidelines).

##### Localization – UI strings

  Our project is localized – it means that we support multilingual text content. That’s why all text strings that will be added/changed into the project should be localized in the separate resource file.

##### Adhering to common themes and styles
 
  When you change existing features or add new ones to the common themes and styles adhere existing styling of these files. Do not create a specific theme or style file that will be used only for your change. See the wiki documentation [here](https://github.com/Microsoft/PowerBI-visuals/wiki/Adhering-to-common-themes-and-styles). 

##### New Visual Development

  Please follow our minimum requirements for implementing a new visual. See the wiki [here](https://github.com/Microsoft/PowerBI-visuals/wiki/Minimum-requirements-for-implementing-a-new-visual). 

Make sure Readme.md file is updated with the latest information of the new visual. All images related to the visuals should go under Images folder [here](/src/Clients/Visuals/visuals/Images/) 

##### Security and privacy review requirements
 
  All changes in the code will be reviewed by the Power BI team for common security and privacy issues. None of any components of the project can do network calls to resources placed outside the Power BI domain. No data can be downloaded outside, no external content can be shown anywhere inside the domain.

##### Performance requirements
 
  The Power BI team will review key performance metrics including initial load time, resize performance, property change time, linear performance with respect to data volume. See our Performance guidelines wiki [here](https://github.com/Microsoft/PowerBI-visuals/wiki/Performance-requirements). 

##### Licensing requirements

  The code you submit should be licensed under the MIT license as we have done for the rest of the repo.  If you use code that you did not author (like from Stack Overflow), you need to ensure correct attributions and license statements are made for those code blocks. Please work with us if you have questions.  

##### Browser support matrix
 
  List of supported browsers is [here](https://support.powerbi.com/knowledgebase/articles/443109-supported-browsers-for-power-bi).

##### Unit tests
 
  Your changes should pass all unit tests. So before submitting a pull request build the project and run the tests using gulp build system. Changes that cause tests to fail will not be reviewed or modified by approvers.

  New functionality also should have appropriate unit tests for that functionality included in the pull request.

##### Description of the changes

Every pull request should include detailed description of the change and should contain:
*	Purpose of the change
*	Description of functionality that was changed
*	Bugs/issues details, if pull request fixes it
 
<br/>
Wow you made it to the bottom! We’re looking forward to seeing what amazing contributions you provide and to helping you get them checked into the repo.

Thanks!

-MAQ Software Team
