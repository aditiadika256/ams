// @ts-check

/** @typedef {import('../../../types/system').Menu} Menu */
/** @typedef {Menu & { children: SidebarMenuNode[] }} SidebarMenuNode */

/**
 * @param {Menu} left
 * @param {Menu} right
 */
function compareMenus(left, right) {
  const orderDifference = (left.order ?? 0) - (right.order ?? 0);

  return orderDifference || left.name.localeCompare(right.name, 'id');
}

/**
 * Normalizes flat or nested API responses into one consistently sorted tree.
 *
 * @param {readonly Menu[]} menus
 * @returns {SidebarMenuNode[]}
 */
export function buildMenuTree(menus) {
  /** @type {Map<number, SidebarMenuNode>} */
  const nodes = new Map();

  /**
   * @param {Menu} menu
   * @param {number | null} inheritedParentId
   */
  const register = (menu, inheritedParentId = null) => {
    const existing = nodes.get(menu.id);
    const node = {
      ...existing,
      ...menu,
      parent_id: menu.parent_id ?? inheritedParentId,
      children: existing?.children ?? [],
    };

    nodes.set(menu.id, node);

    for (const child of menu.children ?? []) {
      register(child, menu.id);
    }
  };

  for (const menu of menus) {
    register(menu);
  }

  /** @type {SidebarMenuNode[]} */
  const roots = [];

  for (const node of nodes.values()) {
    node.children = [];
  }

  for (const node of nodes.values()) {
    const parent = node.parent_id ? nodes.get(node.parent_id) : undefined;

    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (/** @type {SidebarMenuNode[]} */ items) => {
    items.sort(compareMenus);
    items.forEach((item) => sortTree(item.children));
  };

  sortTree(roots);

  return roots;
}

/**
 * @param {readonly SidebarMenuNode[]} menus
 * @param {string} query
 * @returns {SidebarMenuNode[]}
 */
export function filterMenuTree(menus, query) {
  const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');

  if (!normalizedQuery) {
    return menus.map((menu) => ({
      ...menu,
      children: filterMenuTree(menu.children, ''),
    }));
  }

  return menus.flatMap((menu) => {
    const isMatch = menu.name
      .toLocaleLowerCase('id-ID')
      .includes(normalizedQuery);
    const matchingChildren = isMatch
      ? filterMenuTree(menu.children, '')
      : filterMenuTree(menu.children, normalizedQuery);

    if (!isMatch && matchingChildren.length === 0) {
      return [];
    }

    return [{
      ...menu,
      children: matchingChildren,
    }];
  });
}

/**
 * @param {readonly SidebarMenuNode[]} menus
 * @returns {number[]}
 */
export function getExpandableMenuIds(menus) {
  return menus.flatMap((menu) => (
    menu.children.length > 0
      ? [menu.id, ...getExpandableMenuIds(menu.children)]
      : []
  ));
}

/**
 * Mirrors the compact Triomotor navigation: section parents disappear and
 * their actual destinations remain available as icon buttons.
 *
 * @param {readonly SidebarMenuNode[]} menus
 * @returns {SidebarMenuNode[]}
 */
export function getCollapsedMenuItems(menus) {
  return menus.flatMap((menu) => (
    menu.children.length > 0
      ? getCollapsedMenuItems(menu.children)
      : [menu]
  ));
}
