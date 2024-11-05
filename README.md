# photo-annotator


## Key Decisions

- Using Liveblocks for the collaborative annotation feature : They offer everything needed for the feature out of the box, and it's easy to implement. Their config allows the creation of custom hooks using their sdk. This was simple to implement and worked well. Auth is handled on the server side, and we can use the user's session data in the hooks.

- Using Koa/Node for the server: Personal choice, express is also a good choice.
Like using koa because of the supportive community around the package, there is loads of koa sub packages that do specific things, and it's easier to find fixes for issues.

- Using Prisma as the ORM: Simple to use and integrates well with the database, I appreciate the ease of use from making db calls via prisma client rather than using raw SQL that has no type safety.

- Using Supabase: Good documentation, mainly chose them as an 'all in one' solution for the db and storage solution. Would much rather have as many things in one place as possible rather than branching out to an s3 account. Also it's free tier is very good for both these things. For future use, supabase has good real time features and can also be used as an auth solution.



- Schema Choices: 

User: Mostly self explanatory, kept it simple with only an email and password. Decided to store participant maps and owned maps in different tables to make way for future features - e.g nore permissions.

Room: Again mostly self explanatory, storing the imageUrl in the table to make it easier to access when rendering the map.

Annotation: All the annotation data is handled on the liveblocks session, and we call this to load the annotations into the liveblocks storage - and also to sync the annotations using a debounced function.





