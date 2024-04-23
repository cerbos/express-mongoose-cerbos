import express, { NextFunction, Request, Response } from "express";
import { GRPC } from "@cerbos/grpc";
import basicAuth from "express-basic-auth";
import { queryPlanToMongoose, PlanKind } from "@cerbos/orm-mongoose";
import { User, Contact } from "./models";

// Connect to Cerbos
const cerbos = new GRPC("localhost:3593", { tls: false });

// Setup web server
const app = express();

app.use(express.json());

// Swap out for your authentication provider of choice
app.use(
  basicAuth({
    challenge: true,
    users: {
      alice: "supersecret", // role: admin, department: IT
      john: "password1234", // role: user, department: Sales
      sarah: "asdfghjkl", // role: user, department: Sales
      geri: "pwd123", // role: user, department: Markerting
    },
  })
);

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({
      username: req.auth.user,
    });
    if (!user) {
      throw Error("Not found");
    }
    req.user = user;
    next();
  } catch (e) {
    return res.status(404).json({ error: "User not found" });
  }
});

app.get("/contacts", async (req, res) => {
  // Fetch the query plan from Cerbos passing in the principal
  // resource type and action
  const contactQueryPlan = await cerbos.planResources({
    principal: {
      id: req.user._id.toString(),
      roles: [req.user.role],
      attributes: {
        department: req.user.department,
      },
    },
    resource: {
      kind: "contact",
    },
    action: "read",
  });

  const queryPlanResult = queryPlanToMongoose({
    queryPlan: contactQueryPlan,
    // map or function to change field names to match the prisma model
    fieldNameMapper: {
      "request.resource.attr.owner": "owner",
      "request.resource.attr.department": "department",
      "request.resource.attr.active": "active",
      "request.resource.attr.marketingOptIn": "marketingOptIn",
    },
  });

  let contacts: any[];

  if (queryPlanResult.kind === PlanKind.ALWAYS_DENIED) {
    contacts = [];
  } else {
    // Pass the filters in as where conditions
    // If you have prexisting where conditions, you can pass them in an AND clause
    contacts = await Contact.find(queryPlanResult.filters).populate("owner");
  }

  if (req.query.debug) {
    return res.json({
      contacts,
      principal: {
        id: req.user._id.toString(),
        roles: [req.user.role],
        attr: {
          department: req.user.department,
        },
      },
      queryPlan: contactQueryPlan,
      prismaQuery: queryPlanResult,
    });
  } else {
    return res.json({
      contacts,
    });
  }
});

// READ
app.get("/contacts/:id", async ({ user, params }, res) => {
  // Get the user
  if (!user) return res.status(404).json({ error: "User not found" });

  // load the contact
  const contact = await Contact.findById(params.id);
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  // check user is authorized

  const cerbosPayload = {
    principal: {
      id: `${user._id.toString()}`,
      roles: [user.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
      id: contact.id + "",
      attributes: JSON.parse(JSON.stringify(contact)),
    },
    actions: ["read"],
  };

  const decision = await cerbos.checkResource(cerbosPayload);

  console.log(cerbosPayload);
  console.log(decision);

  // authorized for read action
  if (decision.isAllowed("read")) {
    return res.json(contact);
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
});

app.post("/contacts/new", async ({ user, body }, res) => {
  // Get the user

  // check user is authorized
  const allowed = await cerbos.checkResource({
    principal: {
      id: `${user._id.toString()}`,
      roles: [user.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
      id: "new",
    },
    actions: ["create"],
  });

  // authorized for create action
  if (allowed.isAllowed("create")) {
    const contact = await Contact.create(body);
    return res.json({ result: "Created contact", contact });
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
});

app.patch("/contacts/:id", async ({ user, params, body }, res) => {
  // load the contact
  const contact = await Contact.findById(params.id);
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  // Get the user
  if (!user) return res.status(404).json({ error: "User not found" });

  const allowed = await cerbos.checkResource({
    principal: {
      id: `${user._id.toString()}`,
      roles: [user.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
      id: contact.id + "",
      attributes: JSON.parse(JSON.stringify(contact)),
    },
    actions: ["update"],
  });

  if (allowed.isAllowed("update")) {
    await Contact.updateOne(
      {
        _id: contact._id,
      },
      body
    );
    return res.json({
      result: `Updated contact ${params.id}`,
    });
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
});

// DELETE
app.delete("/contacts/:id", async ({ user, params }, res) => {
  // load the contact
  const contact = await Contact.findById(params.id);
  if (!contact) return res.status(404).json({ error: "Contact not found" });

  // Get the user

  if (!user) return res.status(404).json({ error: "User not found" });

  const allowed = await cerbos.checkResource({
    principal: {
      id: `${user._id.toString()}`,
      roles: [user.role],
      attributes: {
        department: user.department,
      },
    },
    resource: {
      kind: "contact",
      id: contact.id + "",
      attributes: JSON.parse(JSON.stringify(contact)),
    },
    actions: ["delete"],
  });

  if (allowed.isAllowed("delete")) {
    Contact.deleteOne({ _id: params.id });
    return res.json({
      result: `Contact ${params.id} deleted`,
    });
  } else {
    return res.status(403).json({ error: "Unauthorized" });
  }
});

export { app };
