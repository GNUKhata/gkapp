The GNUkhata team meets every Monday at 11:30 hrs (IST) to discuss about development, features, outline plans for next release. Feel free to join us & suggest feedback!

Jitsi meet link https://meet.jit.si/GNUKhata2020

# Meeting history (2021-07-12)
Agenda:
- Review past week's progress

Participants: GN, Karthik, Survesh

Updates:
- Karthik:
  * Separate url for creating & editing User, UOM and Godowns
  * Bug fixes for godown component
  * Contacts / Business auto collapse & styling
  * Work on report pp header
- Survesh:
  * Added Account Forms (CRUD)
  * Added Delivery Note support in Invoice form
  * Added information page after creating Invoice, Purchase Sales Order,
  Debit Credit Note, Rejection Note, Transfer Note. (Also updated gkcore
  to return note id after successful creation)

Points Discussed:
- Comments on Account form,
  * The row numbers are not required in Mobile view.
  * Rather than having the account list as a long table with data, 
  display it as nested cards. Group -> Sub-Group -> Accounts
- Comments on having separate URL paths for create and edit of 
(User, UOM, Godowns),
  * Having separate URLs for create and edit operations is an 
  objective approach and is a good practice to follow, even for similar cases
  throughout the app. (e.g. Accounts Forms)
  * This also allows for easily navigating to a certain point in the
  app with just the URL, and can also be shared easily with others.
- Discussion on plans for writing Unit Tests for gkcore (Test
Driven Development approach). This will also make it easy to be released as
a python package, as pip3 requires Unit Tests as part of its package requirements.
- The meeting ended with updating current progress in the gitlab progress tracking
issue.

Conclusion:
- Updates will be performed based on the points discussed above.

# Meeting history (2021-07-05)
Agenda:
- Review past 2 week's progress

Participants: Karthik, R2, Survesh, VK

Updates:
- Karthik:
  * Gkcore
	- Added feature to set postgres database URL with ~GKCORE_DB_URL~ env variable
	- Added CI configuration which automatically builds gkcore, connects to postgres & run tests
	- Attempt to fix tests
	- Work on rollover module
  * Gkapp
	- Added option to set custom URL for gkapp via ~GKAPP_URL~ env variable
	- UI changes to navbar, sidebar
	- nav & refresh buttons for in app navigation
	- fields sorting for stockonhand
	- CSS changes for print view in reports
  * Others
	- deployed pgAdmin on test server to visually see database & helps with SQL commands

- Survesh:
  * Gkcore
    - Work on rollover module
  * Gkapp
    - Added auto generated dates, form numbers and print pages for Transactions (customizable)
	- Moved Invoice form to new codebase based on components
	- Added Transfer Note forms
	- Added Vouchers to workflow page

Points Discussed:
- Dicussions on Data Migration to New Organisation after Rollover,
  * Can the user choose what data can be migrated during this process?
    No, currently a default set of required data is migrated, so no choice is provided.
  * Need to intimate the people in the org, when this rollover happens.
  * Add rollover, new org creation and data migration after rollover to logs, for security reasons.
- Discussions on the ability to use a remote Database for gkcore,
  * If and when a DB switch occurs, it has to be recorded in gkcore somewhere
  (like logs), for security reasons.
- Need a way to intimate the user in the UI if and when a server crash happens.
- Discussions on the Printing formats of Stock on Hand Reports,
  * When printing a report after applying some filters, those filters have to be 
  mentioned in the printed copy.
  * Need an option for adding Printed By and Printed On data to the print copy. 
  (This feature will be required on all pages that can be printed)
- Discussions on Transaction No,
  * Need easy to use UI for editing the Transaction No configuration.
  * Need to add proper validation for Transaction No as per GST rules and regulations.
  (https://taxguru.in/goods-and-service-tax/gst-invoice-gst-invoice-number.html)
- In Transaction form tables, index numbers are needed.
- Need more clarity on which godown the purchased products go to.

Conclusion:
- Updates will be performed based on the points discussed above.

# Meeting history (2021-06-28)
  
  __Meeting was postponed to 2021-07-05__

# Meeting history (2021-06-21)
Agenda:
- Review previous week's progress
- Discuss issues raised in the previous week
- Discuss about Project Milestones, Website and Dev blog

Participants: GN, Karthik, R2, Survesh, VK

Updates:
- Karthik:
  * Stock on Hand Page
  * Register Reports (WIP)
- Survesh:
  * Workflow profile pages for added Transactions
  * Stock on Hand Validation in Transaction form Bill tables
  * Bug fixes

Points Discussed:
- Comments on Rejection Note form
  * Change text "Rejection In" and "Rejection Out" to "Sale Rejection" 
  and "Purchase Rejection"
  * Auto Populate date
  * Show a printable/shareable page after the Rejection Note creation
  (Do this for all Transactions as well)
- Qty field in Bill tables must be UOM aware and only allow decimal values 
for supported UOM
- Need a back button in Workflow page, to go back to any previous page
- Comments on Stock on Hand Page
  * When selecting Godownwise, list all the godowns instead of choosing one
  * Add a "Choose all Products" option to the Product selection dropdown 
  if possible instead of external check box
- Add links to Invoices from Register Reports
- Discussion on Project Milestones
  * First major milestone would be creating a feature complete version of 
  existing GNUKhata Software
  * Second Milstone would be GST compliance, Bank Reconcillation, etc.
  * Future Milestones would possibly include gkcore upgrades, adding 
  Blockchain as Middleware.
- Discussion on Updating current website
  * Add updates about current progress and activities to the 
  website
  * Move website hosting to gitlab (Should be peer tested before going live)
  * Add a Suggestion box feature to the website, where users can 
  send in suggestions
  * (WIP) New website layout link: https://kskarthik.gitlab.io/gkwebsite/
- Discussion on a point release for the existing GNUKhata software, with 
bug fixes for gkcore.

Conclusion:
- UI updates will be performed based on feedbacks received
- First major milestone will be feature completing the existing GNUKhata software
followed by milestones with additions to it.
- The current GNUKhata website will be updated and hosted in gitlab.
- A point release will be made for existing GNUKhata software with bug fixes and additions 
to gkcore.

# Meeting history (2021-06-14)
Agenda :
- Review previous week's progress
- Discuss about issues raised in the previous week

Participants: GN, Karthik, Survesh, VK

Updates:
- Karthik:
  * In Product Register
    - Added Godownwise support
    - Added link to Invoice listed
  * Added Cost Center
  * Display Org Image from DB
- Survesh:
  * Integrated Transactions in Workflow page
  * Bill Table UI imporovements for Mobile view

Points Discussed:
- Several questions were raised on Cost Center and Budgetting features
  * How Cost center and Budgetting features work?
  * Whats the difference between them both, given that they both 
  store budget amount for an entity?
  * Discuss with R2, Arun Kelkar and Abhijith about these questions.
- Suggestion to use the Organisation Image from DB in reports that are generated (Pdf, Printable screens, etc.)
- Discussions on the issues raised by R2 on the Product Register Report
  * (#129) Differentiating Between Invoice types is possible, currently not visible in 
  demo deployment as no other type of Transactions are made.
  * (#128) To tackle having stocks of products in negative, its better to intimate users about low stock
  in Transaction forms. We will implement better validation and warning in the Transaction forms.

Conclusion:
- Questions raised will be discussed with R2, Arun KelKar and Abhijith for better
understanding.
- The List of tasks done and pending needs to be updated in Task Map Issue in Gitlab.

# Meeting history (2021-06-07)
Agenda:
- Review Previous week's progress

Participants: GN, Karthik, R2, Survesh, VK

Updates:
- Karthik:
  * Product Report
  * UI Updates to Side Bar
  * Password Verification Component
  * Login Page UI updates
- Survesh:
  * Date component Validation
  * Multiple Row support for Vouchers
  * Debit Credit Note Form
  * Switch between CGST/SGST & IGST in bill table

Points Discussed:
- Discussion on having login passwords optional for cases such as local deployment.
  * Since the password validation is not strictly enforced, weak passwords can be used in those cases.
- Discussion on creating an automated solutions to right align the form labels.
- In places with long lists of data, (like choosing an invoice in Debit Credit Note, etc), need a 
search widget with advanced filters to query and find the required data. 
  * Later a SQL query API could be added, through which the frontend can query the DB in several ways.
- Comments on the bill table UI
  * The current pagination UI is not intuitive and requires an update.
  * The table requires two modes, (1) List items mode (2) Edit Mode
  *  When clicking on an item from List Items mode, must move to the edit mode with selected item.
- Discussion on whether Debit Credit Note be created for a Customer or Supplier directly instead of an invoice.
  * In the case of customers or suppliers, vouchers are preferred than Debit Credit Notes.
- In Invoice table, CSGT/SGST and IGST must be chosen based on place of supply than using just the states of 
Organisation and Party.
  * This is because some invoices may not need a Customer Shipping Address, like in hotels serving food. [(e.g.)](https://www.gstfever.com/gst-on-hotel-restaurant-canteen-outdoor-catering/)
- Comments on Product report,
  * Text "Product Register" could be used instead of "Product Report" and
    "Document No." could be used instead of "Inv/Dr/Cr No."
  * Needs more filters to query the report list
- Discussion on need for a place to track where we are in the project.
  * Currently we track the progress API wise in gitlab (#55), this could be used to track even UI tasks.

Conclusion:
- The updates discussed this week are to be performed.
- The progress of the app and the tasks pending are to be tracked in the gitlab issue used for API progress (#55).

# Meeting history (2021-05-31)
Agenda:
- Review previous week's progress
- Discuss previous week points with R2
  1. The term used for Rejection Note (Rejection, Return or Cancel)
  2. Showing Tax fields and discount in Rejection Note Table
  3. Adding a boolean flag to UOM to note if its quantity is 
  fractional or not.

Participants: GN, Karthik, R2, Survesh, VK

Updates:
- Abhijith:
  * Login credentials for Gnukhata.in
- Karthik:
  * Remembering last visited organisation (Login Page)
- Survesh:
  * Bill Table UI updates (vertical and horizontal modes)
  * Date component with different date format support

Points Discussed:
- Discussuion on the Bill Table updates:
  * The toggle option between vertical and horizontal modes can be avoided as
  it can be confusing and based on the screen size, one of the two modes may not
  be user friendly.
  * Use vertical mode as default for vertical mobile screens and horizontal mode 
  for wider screen sizes.
  * Use Zoho's mobile app as a referrence to improve the vertical table layout.
- The date component requires a validation when a bad date is entered manually.
- Discussion on the Login page updates:
  * Can the last used user name be auto loaded, as its done for 
  the company name and financial year? Currently not possible as it requires 
  API support.
  * The form labels can be right aligned as in Transaction forms.
- Discussion on the need for different types of discounts:
  * Type 1: Discounts on things like pending payments to or from the organisation
  and the ability to add tax on them.
  * Type 2: Special Discounted rates for bulk purchase of items.
- Discussion on points from last week's meeting with R2:
  * (Point 1) R2 will get back on this
  * (Point 2) GST requires an invoice to be presented with its tax and discount
  * Currently we can achieve this manually with Debit Vouchers with multiple 
  Cr and Dr rows.
  so the Rejection note table needs to display those fields as well.
  * (Point 3) Not dicussed in the meeting due to time constraints.
- Debit/Credit notes are supported by GST and Rejection note is not as its is used 
for internal purpose.
  * Thus find a way to combine rejection note within the Credit/Debit Note form,
  as its also done the same way in other accounting softwares (e.g. Zoho Books).
- Discussion on moving the domain gnukhata.in from its current provider to providers
like gandhi.et

Conclusion:
- Perform the UI updates discussed in the meeting
  * Setting Table modes based on the screen sizes and updating its vertical view 
  based on zoho mobile app.
  * Use right aligned form labels when they are horizontally alligned with the input
  field.
  * Find a way to combine Debit/Credit Note and Rejection Note
- Make a note of Discount features required in gkcore

# Meeting history (2021-05-24)
Agenda:
- Review previous week's progress

Participants: 
GN, Survesh, VK

Updates:
- Karthik:
  * Auto selection of Org and Org Years (Login Page)
  * Category form UI (WIP)
- Survesh:
  * Rejection Note form
  * UI updates in Bill and Total table,
  right alignment of form labels

Points Discussed:
- Discussion on Rejection Note form:
  * In the Bill Table, can the verb "Return" be used instead of "Reject".
  (Discuss with R2)
  * Add checkboxes to reject all qty of a product.
  * Add quicker validation for Rejected Qty field, than on after pressing create
  button.
  * Change the text of create button to "Reject" or something like that.
  * In the Bill table, explore the possibility of showing only 
  Item, Qty, Rejected Qty columns. (Discuss with R2)
  * Must add provision for specifying a Rejection Fee.
  * The "Create New Product" Button must not be visible in the Bill Table.
- Comments on Bill Table component:
  * Update: IGST, CESS, VAT fields are hidden in mobile view.
    Comments: Columns must not be hidden completely, Use a collapsable
    table here so that the full table data is always there.
  * Use a vertical table layout to tackle the above mentioned issue.
  Add traversable buttons here to navigate between the multiple rows.
  * In vertical table layout, the amounts must be right aligned.
  (currently left aligned)
  * The Qty field, must be aware if the product can be fractional in
  quantity or not. Add an extra field in create UOM form, to store 
  this data. (Discuss with R2)
- In Total Table component, the roundoff radio button currently doesn't
have a label stating its purpose. Convert this into a labelled switch or
button.
- Comments on Login page:
  * When the Org and Org Years are disabled the up/down arrows must be hidden.
  * There must be an option to choose the default Organisation, which will be
  selected automatically when the login page is opened.
  * The last visited organisation must be selected automatically when the login
  page is opened the next time.
  * The last visited org will take higher priority than the default org.
  * Both Last visited and Default org data will be stored in local storage.
- In Category form, the text in select fields get hidden in mobile view. 
This must be visible fully.
- The date format must be configurable globally (priority).
- Discussion about emphasis on Mobile First UI, since the rewrite of UI is being
made mainly for Mobile UI.

Conclusion:
- Must check the points marked as "Discuss with R2" with R2.
- The UI must be made solely with Mobile View in mind, all features
and data must be accessible in mobile view with ease of use.
- Perform the UI updates and features discussed in the meeting.

# Meeting history (2021-05-17)
Agenda:
  - Review previous week's progress

Participants: 
Karthik, GN, R2, Survesh, VK

Updates:
- Kathik:
  * UOM color coding based on its GST status
  * Linking UOM units with GST compatible default UOM units
  * Gkcore updates:
    - Added GST approved UOM list
    - Added missing Ladakh in the state list
    - Updates with Gunicorn
  * Added How TO wiki in Gnukhata Build repo
- Survesh:
  * Added Purchase Sales Order form
  * (WIP) Debit Credit Note, Transfer Note, Rejection Note

Points Discussed:
- In Login page, if the username and password fields have extra
spaces in the end, its causing an issue.
- In UOM listing UI, make the GST compatible units green than black.
- Right align all the form labels, so that its easy to associate them
with the input area.
- The expand and close button for cards in mobile view are confusing and 
must be changed.
- Declutter the Bill tables in Transaction forms.
- The listing UI for workflow items must have a export data button.
Must support CSV now, can add pdf support later.
- In Purchase Sales Order, the payment method used must not update as a
transaction in the backend.
Check https://retail.erpnext.com/ for Purchase Sales order implementation.

Conclusion:
- The UI updates in points discussed will be performed.
- The payment method used in Purchase Sales order forms will be checked if they 
affect the backend as a transaction.

# Meeting history (2021-05-10)
Agenda:
- Review previous week's progress

Participants:
Karthik, R2, Survesh, VK

Updates:
- Karthik:
  * Cost center component (CRUD)
  * Docker compose for gkcore and gwebapp
  * Added Build instruction wiki for gkcore & gkwebapp

Points Discussed:
- Moving to Docker compose from docker has normal writing normal docker files
has reduced the docker container size by 200MB.
- Abhijith has given access to DockerHub Account for GNUkhata
- Discussions on UOM list,
  * There is a list of 38 government approved UOM items that 
  has to be used for GST.
  * Currently used accounting softwares allow the creation of custom, non
  standard UOM units for internal usage. These can later be mapped to 
  standardized UOM units when used in a GST setting.
  * We need to have a provision that says the created UOM unit is either a
  standard one or is mapped to a standard one or not. Also this can be color coded
  for ease of use.
  Green - Standard Unit, Amber - Mapped to Standard Unit, Red - Not Mapped to Standard Unit
  * Also we can't use only the GST standard UOM units at all times, as there might be 
  organisations that don't fall under GST regulations.
- Discussion on keeping the app from being hardcoded into a India specific 
accounting package.

Conclusion:
- Add the provision to store the status of a UOM unit, whether if it was standard or 
if it was mapped to a standard one.

# Meeting history (2021-05-03)
Agenda:
- Review previous week's progress

Updates:
- Karthik:
  * Godown forms completed (CRUD)
  * Cost Center (Listing, Creation UI)
  * Replaced Waitress with Gunicorn in gkcore & gkwebapp
  * Added side bar
- Survesh:
  - Delivery Note and Cash Memo forms (UI + API integration)
  - Purchase/Sales Order, Transfer Note, Rejection Note (UI)
  - Debit/Credit Note (WIP)

Points Discussed:
- Waitress was replaced with Gunicorn, as waitress didn't support SSL.
- Discussion on the name of Cost Center,
  * Cost center or Cost accounting is used with the aim of reducing 
  cost.
  * Profit center or Profit accounting is used with the aim of 
  improving profits.
  * So the term Cost center should be used.
- In Edit Godown form, the confirmation box needs to include more 
information.
- The transaction form number must be configurable.
  * Related issues: 
  https://gitlab.com/gnukhata/gkwebapp/-/issues/1309
  https://gitlab.com/gnukhata/gkcore/-/issues/491
  * Example: https://www.youtube.com/watch?v=D0qg46Eu1z4
- API's used currently by gkapp is sending more data than required.
  * In the future, this can tweaked to accomodate only the required data.
  * Also API's that return lists of data must be paginated.

Conclusion:
- Perform the UI updates discussed.
- Explore on ways to configure Transaction form number
- In the future, the gkcore API's need to be tweaked as per requirement 
and needs pagination feature.

# Meeting history (2021-04-26)
Agenda:
- Review previous week's progress

Updates:
- Karthik:
  * Replacing Nginx Server with Caddy
  * Godown form (Listing)
- Survesh:
  * Deconstruction of Invoice form into individual components
  * Delivery Note and Cash Memo Form UI


Points Discussed:
- Why replace Nginx with Caddy
  * Auto renewal of SSL
  * Uses and manages LetsEncrypt certificate, given a valid domain name
- Caddy has an issue, where the static assets are served via http
  * Possible solution: make waitress listen from port 443
- Discussions about Docker Container,
  * Use of single parent directory must be preferred for Docker Containers,
  instead of different unique ones.
  * This helps keeping track of different container data.
  * Since Docker Containers are volatile in nature, data requiring persistence
  must be stored in the disk.
- Comments on Delivery Note form,
  * In total Table, the rupee symbol takes up one extra line, make adjustments
  to keep both rupee symbol and the price in same line.
  * In Bill Table, the Item input field is smaller than other input fields. Make
  its dimensions equal as the others.
- Update from Abhijith, the Social handles of GNUKhata are managed by an HR from Accion
(Rachita Jha).

Conclusion:
- Try making waitress listen from port 443 to fix the issue with Caddy.
- Use single parent directory for the Docker containers created.
- Store data that requires persistence in disk and not in Docker container.
- Perform the UI updates discussed.


# Meeting history (2021-04-19)
Agenda:
- Review previous week's progress
- Discuss about Server Deployment methodologies

Updates:
- Karthik:
  * GNUKhata dev server deployment in Digital Ocean Droplet 
  * Configure default gkcore URL with Environment variable
  * Godown Page Listing
  * Side Pane Demo
- Survesh:
  * Editable Billed To section
  * Bug Fixes
  * Delivery Chalan (WIP)
- Abhijith
  * To work on Roll Over bug fix
  
Points Discussed:
- Comments on Delivery Chalan form:
  * The card close and open icons are very similar and can be changed 
  to something easy and unique. Possibly even color coded.
  * It would be nice if the heading of the cards are configurable.
- Since side panes are a staple in desktop apps, The navigation options 
can be moved from the top bar to the side nav bar.
- Discussion about the Dev server hosting and practices to be followed:
  * The process used in hosting the server can be blogged explaining 
  why and how to perform the same.
  * In a conversation into industry best practices for deployment
  of servers, using Docker was decided to be a good choice, given
  its ease of use and accessiblity by people from different walks of
  life within the tech industry.
  * Using Docker Compose should be preferred than to writing the 
  Docker files from scratch. Alternatives like Ansible could be 
  explored.
  * Currently the Docker Compose written will support NGINX as the 
  default load balancer than Apache.
- Conversation about future plans:
  * Explore Ways to package GNUKhata's gkapp with tech like snaps, 
  flatpaks or appimages.
  * gkcore (Docker) & gkapp (snap/flatpak/appimage)
  * Releasing a Debian package of GNUKhata in the future.
  * Once the UI is done and is distribution ready, Unit Tests have 
  to be written for gkcore.
  * Possibly rewrite gkcore without a hard dependency on RDBMS and 
  move to Flat File model, so as to support easy encryption and 
  better portability.

Conclusion:
- Docker will be used for packaging and deploying gkcore.
- Docker Compose will be used to configure Docker and Nginx for our needs.
- Options to package gkapp, like snap-flatpak-appimage should be explored.
- Implementation of the side navigation pane.

# Meeting history (2021-04-12)
Agenda:
- Review previous week's progress
- Discuss about the following topics:
  1. How GST is handled in other accounting softwares
  2. Server requirements for Gnukhata dev setup and Discourse

Updates:
- Karthik:
  * Product Categories and Sub Categories (Listing & CRUD)
- Survesh:
  * CESS accounts in OrgProfile page
  * Adjust on-credit invoices from workflow page
- Fixing gkcore and gkwebapp dependencies and merging the PR for reports by Abhijith in gkcore
  
Points Discussed:
- Categories and Subcategories listed can be shown as a tree, with subcateries listed
under the parent categories.
- In OrgProfile and Invoice Details page, the numbers displayed in table columns must
be right aligned.
- (Topic 1) Discussion on,
  * How the state of the organisation and the states involved in the invoices for
purchase and sales, affects the GST.
- (Topic 2) Discussion about,
  * Server requirements, in terms of resources needed and usage estimates.
  * Hosting Discourse as a separate instance than along with the dev server.
  * Starting Discourse soon.
  * Making discourse the place for community interactions and slowly transitioning from Telegram.
  * Adding bots to Telegram group to constantly update about the discussions on Discourse.

Conclusion:
- UI updates based on the comments recieved in points discussed.
- Topic 1
  * The GST must be IGST(18%), when the Organisation's (or its counterpart in invoice) state and the states involved in the invoice are different.
  * It must be CGST(9%) and SGST (9%) when the Organisation's state and the states involved in the invoice are same.
- Topic 2
  * Server requirements for the GNUKhata dev setup is minimal and since it is only for dev purpose
  not for public consumption, we can go with the starting tier.
  * After the dev server is hosted and is running, after a few weeks, Discourse could be hosted on
  a separate instance with the required minimum specs.
  * Slowly tranisiton from Telegram to Discourse for community interaction and use Telegram internally
  for discussions among team.

# Meeting history (2021-04-05)
Agenda:
- Review previous week's progress
- Discuss about keyboard shortcuts
Updates:
- Karthik:
  * Password Reset
  * Table UI update in User Profile, Logs page
- Survesh:
  * Edit Invoice
  * Bug fixes

Points Discussed:
- The log text must follow a specific pattern, to make querying the logs easier.
- Comments on Create Invoice form:
  * In the Create Invoice form, to fix the searchable dropdown UI error, try to
increase the footer height when the bottom most dropdowns are activated.
  * The unwanted columns in the Bill table could be removed to accomodate the table in mobile view.
  * Could have a Button to swtich between detailed table view and Undetailed view.
- Discussion about how to implement keyboard shortcuts in the app and about following the
common conventions used in other accounting programs.
- Comments on Contacts Profile page:
  * In Contacts Profile page, either the Delete Contact button or View Transactions button should be
displayed. As only contacts who do not have any transactions can be deleted.
  * Add a button to display the transactions that are related to a contact. This can be done either
as an overlay in the same page or take to the Transaction page with a filter containing the Contact's id.

Conclusion:
- Perform the updates discussed in the points discussed for Create Invoice form, Contacts Profile, etc.

# Meeting history (2021-03-29)
Agenda:
- Review previous week's progress

Updates:
- Karthik:
  * Unit of Measurement (CRUD)
  * Custom Loading UI
  * Workflow cards selectable by Tab
- Survesh:
  * Tax flows in Contacts, Business and OrgProfile

Points Discussed:
- Discussion on taking responsibility and charge of the websites and domain names that come under
GNUKhata name.
- Comments on UOM page:
  * Add a warning when deleting a UOM saying that its forever.
  * Find out the most used UOM items and only provide that as default set.
- Logs for actions in Accounting software has been made mandatory in India by law.
- In Log page, follow a pattern for log text so that they are easily queriable.
- Discussion on providing better support to students who use GNUKhata. Like
creating a excercise book that solves the governement accounting syllabus using GNUKhata.
- Comments on tables:
  * Alternating colors for the rows
  * Vertical table layout for mobile view

Conclusion:
- Update the UI based on the comments from the points discussed.
- Discuss with R2 to come up with the set of commonly used UOM
- Finding out the owners of the websites and domains for GNUKhata
and request for maintainer access.

# Meeting history (2021-03-22)
Agenda:
- Review previous week's progress
- Discuss about the following topics:
  1. API from gkcore for importing and exporting data  
  2. Should we use the name Organisaiton or Company or Account
  3. Ability to show Product quantity while creating an invoice for an item
  4. Should a customer/supplier have more than one GSTIN

Updates:
- Karthik:
  * Captcha Component with refresh feature
  * Security Questions component
  * Preventing the last user in an org from deleting themselves
- Survesh:
  * Cancel Invoice and Change of fetch invoices list API
  * Skip uneditable fields when using TAB in Create Invoice Form
  * UI updates to Create Organisation page 
  * Removed number increment on mouse scroll

Points Discussed:
- Update the text case of questions to be uniform in the Security Question component.
- (Topic 1) Feature request for Import and Export of Data API in gkcore
- In Invoice Creation form, the qty field in the bill table must be tab accessible when
a product is chosen.
- In cancel invoice confirmation, use numbers instead of words to describe
the Invoice amount.
- (Topic 2) Discussion on the naming convention for Company/Organisation.
- Discussion on making Date Format, Naming convention for Company/Organisaiton
as configurable elements.
- (Topic 3) Discussion on displaying the Product Quantity along side its name in Invoice page,
when creating the bill. So that,
  * Products that are empty can be avoided while billing.
  * Products with very low inventory can be intimated to the admin for restocking
- (Topic 4) Discussion on a customer or supplier (say Godrej) having only one GSTIN mapped to them
and creating separate customers/suppliers (say Godrej_Punjab or Godrej_Delhi) to
add GSTIN for them in other states.
  * R2 suggests that this approach is widely used and would also help while going
  through the reports.
  * The ability to group these sub Customers under a main Customer could also be useful.

Conclusion:
- Make the UI updates in (Security Question component, Invoice form &
Cancel Invoice Confirmation) based on the points discussed.
- Topic 1 -> A feature request has been made for import and export
of data API in gkcore.
- Topic 2 -> The term Organisation will be used for now, but this should be a
configurable text.
- Topic 3 -> Add Provisions to show the Product quantity based on its
inventory count. The intimation for restocking when inventory is low
can be implemented later.
- Topic 4 -> Do not implement the multiple GSTIN per customer/supplier feature.
Let the users create individual customers/suppliers based on their own naming
convention for now.

# Meeting history (2021-03-15)
Agenda:
- Review previous week's progress

Updates:
- Karthik:
  * UI updates in User Management page: Searchable table of Users, New UI for editing User data
  * Change password module
- Survesh
  * Updates with Searchable dropdown
  * Bug fixes and UI updates in Create Org Page
  
Points Discussed:
  - Comments on change password form:
    * Hide the confirm password field data as dots
    * Discussion about adding captcha here for security purposes
  - Use a standard set of questions for password recovery question in Add User form
  - Discussion about using a third party service provider to check the security parameters of the app in general
  - Comments on Create Org form:
    * Needs a confirm password field
    * Password recovery question and answer must be on two lines instead of one
    * Use Indian financial year (Apr 1 - Mar 31) as the default financial year, when opening the Create Org form
  - Add simplification of Keyboard Navigation in Invoice page to the roadmap and start discussions on ideas for it.
  
Conclusion:
 - Make updates to the forms based on Points discussed
 - Discuss more about ideas for easy keyboard navigation in the app

# Meeting history (2021-03-08)
Agenda:
- Review previous week's progress

Updates:
- Karthik:
  * Create User form (User Management flow)
  * Godown in User Form
- Survesh:
  * Confirmation boxes with Transaction details 
  (Vouchers & Billwise Adjustment flow)
  * Searchable DropDown
- Abhijith: 
  * Experimenting with PDF creation python libraries
  * Progress with Converting R2's Tally data into GNUKhata data

Points Discussed: 
- Comments on Create User Form:
  * User display name and User login id could be separate,
  as currently the User Name is used for both.
  * Can use a verifiable email id as User login id,
  the verification part can be implemented later on, 
  a verified flag would be nice to have now.
  * User name should not be displayed twice, possibly try out a searchable card based UI
- Discussion about Logs of events happening that admin can view:
  * It would be nice to have a notification or intimation when a 
  new log has been registered.
  * Currently logs in gkcore, do not record the proper timestamp. (BUG)
- Discussion about Deleting User
  * Transactions are recorded without dependency on the User table, 
  so on the event of a user being deleted transactions created by them won't be affected.
  * Also currently GKCore allows for the deletion of the last remaining user, creating an
unusable state. (BUG) (Decided to make a temporary fix on client side, to prevent this)
- In Voucher forms, there must be an option for creating multiple Dr/ Cr rows
- Remember the Indian state selected in the forms in local storage,
so that it will be usefull the next time, if the same state is required (Which usually is).
- Discussion on Creating a few reports first and deploying them in gkcore, so that UI can be made for them.
- Discussion on placement possibilities for Items under Vouchers and Documents in gkwebapp, in the new gkapp.
- Discussion on the meaning of purchase order, debit/credit note Voucher vs Documents.

Conclusion:
- Update User Management page and Voucher form based on feedback
- Create few reports in gkcore
- Save User preferrences locally

# Meeting history (2021-02-15)
Agenda:
- Review last week's tasks (Updates on real time data gathering and UI tasks)

Features Showcased:
* A page to set the gkcore URL that the Client side code will use
* Configuration for Invoice Page

Points Discussed:
- Comments on gkcore URL setup page:
  * Change text GKCore server URL to GNUKhata Backend URL.
  * Make the text inside the continue button dynamic, so that it says "Continue to Default Server" when no URL is entered or Add a separate button for it
  * This URL must be saved once set and mustn't prompted for, on every login
- Comments on Filter option in Workflow page:
  * Text change from Items to Type and convert the drop down to radio buttons
  * Remove sortby Property dropdown, sort order buttons and combine them like a sortable table header
  * Add filtering options to query based on date range, Items in a invoice, etc.
    e.g. Filter to view the transactions involving "Car" between the dates 01-04-2020 and 30-06-2020
- Comments on Configuration for Invoice page:
  * Must be visible only to users with admin role
  * Create an API to store this config in gkcore, so that the config can be used by every user of a GNUKhata 
organisation
- Concerns raised by R2:
  * Number fields in the forms change when scrolled over them (Firefox)
  * Stocks involved in Transactions are deletable, this could cause integrity issues
  * Could have the option to denote if an Invoice is independent of Tax
  * Need for Global config where if only GST is opted, UI options for VAT doesn't appear anywhere in the app.
- Updates from Abhijith
  * Since the Reports are generated by gkwebapp and its not part of gkcore, he will be working on integrating reports with gkcore
  * Experiment with implementing keycloak in gkcore

Conclusion:
- Perform the UI updates based on the comments from the points discussed

# Meeting history (2021-02-08)
Agenda:
- Review last week's tasks (Gathering real time data, UI updates based on feedback)

Points Discussed:
- Updates on collecting realtime data
  * An accountant from Accion has decided to give old accounting data
  * VK can provide Tally data from his Co-Op, that is 5 years old
  * R2 can provide recent Tally data, with GST data
  * Abhijith will check with Prajaktha and KK, if they have old Accion data that they had used before
- Need for, a standardized procedure for converting Tally data to GNUKhata data. This should be easy enough to be performed by anyone after reading up on its procedures.
- Comments on Contacts and Business Item Details page:
  * Make sure the nested cards does not occupy too much horizontal space in mobile view
- Comments on Invoice page:
  * Organisation address, state, pin code must be got from gkcore
  * Billed To must be editable
  * The Invoice page elements must be configurable by a user editable JSON
  * Info cards must be togglable in mobile view
  * R2 suggested that, MRP calculated must be inclusive of tax in Products/Service created. But currently tax is added on top of MRP to find total.

Conclusion:
- Try to gather data from the listed sources and convert into GNUKhata compatible data. And Upload it into test server for visualization.
- Perform the UI updates based on the comments received.

# Meeting history (2021-02-01)
Agenda:
- Review last week's tasks (Organisation Profile form, Business item details, Invoice Form, Data Dump, etc)

Points Discussed:
- Discussion about getting Real life data and creating our own sample data,
  * Sample data can be useful while development, but to cover all cases, an extensive real life data is required.
  * Ask the community if anyone is willing to give their obfuscated real life accounting GNUKhata data, so that we can use that as a reference while development.
- Discussion on how the Company's logo is stored in gkcore, its a base64 image.
- Comments on Invoice form:
  * Using nested cards, is space consuming (horizontally) in mobile view, try removing their borders if necessary.
  * The Billed To section is not required if we choose a contact before hand, or can be auto filled
  * Add a create Transaction Button in contact's detail page
  * In the top the details can be placed in the order, 
    + 1. Billed To, 2. Invoice Details, 3. Shipping Details
  * The dropdowns in the form must be searchable, if they are too long
  * Add Create Customer/Supplier and Product/Services buttons
  * Discussion on, Should Total amount in words be sent from the frontend
  * Invoice comments could have a template of comments to choose from, rather than just having to type everytime
  * Discussion on need for Invoice applicable by date, or payable by date. Currently can be noted in comments
  * Add a share button, to share the invoice via, email, etc.
- Comments about Business Item Details page (Right pane) and Organisation Profile page,
  * The cards can be made collapsable, so that at a glance we can see the data and if needed we can click on them and edit them
- Add Close books and Roll over to nav bar drop down menu and it should be visible only to the users with Admin role.

Conclusion:
- Ask the GNUKhata community if someone is willing to share their obfuscated accounting data for our development purposes
- Update Invoice form, Business Details and Organisation Profile pages based on the comments from points discussed

# Meeting history (2021-01-25)
Agenda:
- Review last weeks tasks (Transactions, Active workflow data, Sample Data Dump, etc)

Points Discussed:
- Showcase of Colour Bar to represent the gkapp version 
- Comments on Customer/Supplier Details in the right pane,
  * Keep edit button in the top right
  * Hide the edit button when in edit mode
- Comments on Filter option for the workflow data list,
  * Change the text Item to something meaningful like "contacts" or "business"
  * Save the filter preferrences once set in local storage
- Add User preference and company preference page UI
- Company name should be visible in the top
- Explore how to create and switch between different financial years, without creating a new organisation
- Discussion about the possibility of using the same user for many organisations
- Discussion about sample data:
  * R2 suggested that they have tally data and tally ERP 9 is partially compatible with GNUKhata
  * Also suggested some sample data that can be obtained from the GNUKhata demo page
  * Will also discuss with Abhijith about the possibility of manual entry if needed
    
Conclusion:
- UI updates based on discussion (Details on right pane, filter)
- Add User Preference, Company Preference
- Update Sandbox with Sample Data

# Meeting history (2021-01-18)
Agenda:
- Review the changes in the workflow page UI

Points Discussed:
- Customer/Supplier data list must be combined into a single filterable list, than being tabbed
- Doubt: How the backend is handling Customer & Supplier, can a Customer be a Supplier for a transaction if required
- Integrate Transaction's related UI to the workflow
- Get data dump for the sandbox server to test the UI and check how the UI looks in GKwebapp
- Display data corresponding to the active workflow item

Conclusion:
- Transaction related UI in the workflow page
- Display active workflow item data in the right pane
- Get sample data dump for the sandbox

# Meeting history (2021-01-11)
Agenda:
- Review the migration of pages from Buefy to Bootstrap-Vue

Points Discussed: 
* GNUKhata's various support forums:
  - Finding out about the existing support forums and their owners/maintainers
  - Some known ones are GNUKhata support page, mailing list, telegram, matrix
  - Focusing on supporting through one forum than many, as it will be easy to manage in the long run
* The difference between "Opening Stock" field in the Product Details page 
  and the "Stock" that gets created with transactions like Buy & Sell
* Having GNUKhata as a full feature package instead of splitting it into 3 variations 
 (Accounts, Accounts + Invoicing, Account + Invoicing + Inventory)
* Comments on Workflow page:
  - List the workflow page items such as "Customers" and "Products", like a list of scrollable cards 
    + (Like in a chat app like telegram)
  - The order of this list of cards should be filterable (by properties like date, alphabet, etc.)
  - Add 2 new Workflow items
    + Transactions
    + Reports
  - Club Workflow items
    + Customer/Supplier into "Contacts"
    + Products/Services into "Goods & Services"
  - Add a field to choose between the clubbed items, in their respective forms

Conclusion: 
- Find out about the various support forums for GNUKhata
- Update the Workflow page UI based on the comments from Points Discussed

# Meeting history (2021-01-04)
Agenda:
- Product / Service forms in workflow page
- UI framework with Accessibility support

Points Discussed: 
* Comments on Product / Service forms:
  - The different panes in the forms, like price, stock, tax, could be distinguished by colours.
    + As they currently merge with the background and make it hard to distinguish hierarchy
  - Input fields could be colour coded based on their type.
    + e.g. money fields could be coloured saffron through out the app, and so on
  - Reduce white spacing in the forms and app, where possible so as to make the UI compact.
    + e.g. In form, the field title and input area could be placed on the same line, instead of two
  - Remove redundant text and contextually understandable text in form.
    + e.g. Create Organisation Name -> Organisation
    + Organisation Name -> Name, Organisation Type -> Type, Admin Name -> Admin
  - Doubts: 
    + Does GST have to be recorded in two parts (State and Central)?
    + Is VAT still required, since we are using GST?
    + Is GST calculatable from HSN code?
* Comments on UI framework with Accessibility support:
  - The Bootstrap-Vue demo made to replicate the existing UI flows, got good accessibility scores in Chromium lighthouse.
  - Since the accessibility support was built in and had better documentation on how to add the same, was easier to implement. 
  - Thus Based on the output of this demo, decision was made to port the existing UI flows to Bootstrap-Vue and continue from there

Conclusion: 
- Migrate from Buefy to Bootstrap-Vue
- Incorporate comments on UI enhancement (White spaces, Redundant text, Distinguishing with Colour codes)

# Meeting history (2020-12-28)
Agenda:
- Review last week's task list

Points Discussed: 
* Accessibility aspect of gnukhata: Research with accessibility rich frameworks
  - Create a demo with the accessible rich framework
  - Compare the demo with the existing setup in terms of ease of adding accessibility, size of final output, etc.
* Question: How are service providers handled in GNUkhata? Does it take in account the time taken to provide a service?
* Bring Customer, Supplier, Product, Service, Invoice and Report profiles under a single page called Workflows
* Ask a company their GNUKhata accounting data for research and understanding purposes
* Milestone Basic: January 15th
  - Workflow Page: Customer, Supplier, Product, Service, Invoice, Report profiles
  - User Page: Create, list users
* Discuss and change how the current forms look, to make it more easy to use
  - e.g. In the Create Customer Form, 
    + Pincode could be taken directly from the address input field
    + State could be selected from the Pincode, rather than entering manually
* Data privacy: Hide sensitive client data by masking them from users without proper privileges

Conclusion: 
- Add product/service tab
- Explore alternative frameworks which prioritize accessibility
- Obtain real data on financial year of a company for better understanding of 
inventory & accounting

# Meeting history (2020-12-21)
Agenda:
- Discuss about versioning scheme for gkapp
- User stories

Points Discussed:
* Make sure the webapp is Screen reader compliant and follows the general accessibility standards
* Webapp must be ready for localization, possibly reuse existing localization resources (Malayalam, Marathi, Hindi, English)
* For forms, make the first field selected by default, to make it more accessible
* User Story Comments
  - The current User stories have been written using the existing software as base
  - The User stories have to be created by talking with and taking feedback from actual people 
  with accounting needs from various backgrounds
  - For example the budgeting needs of an Non profit, may require some custom fields that the 
  software must have provision to create
  - Use cases like the above example should also be thought of and addressed
  - Better UI flows like Usage based UI design patterns could also be brought in to make the 
  UI flow easier
* Make the most used pages in the web app more user friendly, like the Invoice creation page, 
  Customer/Seller page, Product/Service page
* For the Customer/Seller page, Product/Service page, use UI like in chat apps
* For example if you take a Customer page, all the customers will be listed, and on clicking on the customer, 
  the transactions with that customer will be listed. Also the list of customers could be sorted based on filters,
  a particular customer must be searchable using a search bar.

Conclusion:
1. Creating Customers, Sellers
2. Localization
3. Screen reader support